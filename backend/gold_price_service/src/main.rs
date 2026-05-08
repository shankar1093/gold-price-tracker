use actix_web::{get, web, App, HttpServer, HttpResponse, Responder};
use reqwest;
use serde::{Serialize, Deserialize};
use std::sync::{Arc, Mutex};
use tokio::time::{self, Duration};
use futures::StreamExt;
use actix_web::http::header;
use async_stream::stream;
use actix_web::web::Bytes;
use mime;
use std::collections::HashMap;

#[derive(Serialize, Debug, Clone)]
struct GoldPrice {
    id: String,
    source: String,
    description: String,
    bid: String,
    ask: String,
    low: String,
    high: String,
}

#[derive(Deserialize, Debug)]
struct RsblEntry {
    #[serde(rename = "Ask")]
    ask: Option<f64>,
    #[serde(rename = "Bid")]
    bid: Option<f64>,
    #[serde(rename = "High")]
    high: Option<f64>,
    #[serde(rename = "Low")]
    low: Option<f64>,
    #[serde(rename = "webDisplayName")]
    web_display_name: Option<String>,
}

#[derive(Serialize, Debug, Clone)]
struct LiveRate {
    rate_999_per_gram: f64,
    rate_22kt_per_gram: f64,
    rate_18kt_per_gram: f64,
    valid: bool,
}

#[derive(Serialize, Debug)]
struct ErrorResponse {
    error: String,
}

type SharedState = Arc<Mutex<Vec<GoldPrice>>>;

async fn fetch_gold_price(api_url: &str) -> Vec<GoldPrice> {
    let response = reqwest::get(api_url).await;
    match response {
        Ok(response) => {
            let body = response.text().await;
            match body {
                Ok(body) => {
                    let source = api_url.trim().split("/").last().unwrap_or("").to_string();
                    let lines: Vec<&str> = body.trim().split("\r\n").collect();
                    let mut prices = Vec::new();
                    for line in lines {
                        let parts: Vec<&str> = line.trim().split("\t").collect();
                        if parts.len() >= 6 {
                            prices.push(GoldPrice {
                                id: parts[0].to_string(),
                                source: source.clone(),
                                description: parts[1].to_string(),
                                bid: parts[2].to_string(),
                                ask: parts[3].to_string(),
                                low: parts[4].to_string(),
                                high: parts[5].to_string(),
                            });
                        }
                    }
                    prices
                }
                Err(_) => { eprintln!("Failed to parse response body from {}", api_url); vec![] }
            }
        }
        Err(_) => { eprintln!("Failed to fetch from {}", api_url); vec![] }
    }
}

async fn fetch_rsbl_price() -> Vec<GoldPrice> {
    let api_url = "https://rsbl-spot-gold-silver-prices.firebaseio.com/liverates.json";
    let response = reqwest::get(api_url).await;
    match response {
        Ok(response) => {
            match response.json::<HashMap<String, RsblEntry>>().await {
                Ok(data) => {
                    data.into_iter()
                        .filter_map(|(key, entry)| {
                            let display = entry.web_display_name.as_deref().unwrap_or("");
                            let ask = entry.ask?;
                            // only include 999 gold without GST entries
                            if !key.contains("999") || display.to_lowercase().contains("gst") {
                                return None;
                            }
                            Some(GoldPrice {
                                id: key.clone(),
                                source: "rsbl".to_string(),
                                description: display.to_string(),
                                bid: entry.bid.map(|v| v.to_string()).unwrap_or("-".to_string()),
                                ask: ask.to_string(),
                                low: entry.low.map(|v| v.to_string()).unwrap_or("-".to_string()),
                                high: entry.high.map(|v| v.to_string()).unwrap_or("-".to_string()),
                            })
                        })
                        .collect()
                }
                Err(e) => { eprintln!("Failed to parse RSBL response: {}", e); vec![] }
            }
        }
        Err(e) => { eprintln!("Failed to fetch from RSBL: {}", e); vec![] }
    }
}

fn adjudicate(prices: &[GoldPrice]) -> LiveRate {
    let candidates: Vec<f64> = prices.iter()
        .filter(|p| {
            let desc = p.description.to_lowercase();
            let id = p.id.to_lowercase();
            let is_999 = desc.contains("999") || id.contains("999");
            let is_gold = desc.contains("gold") || id.starts_with("gold") || id.starts_with("gld");
            let is_silver = desc.contains("silver") || id.contains("sil");
            let is_plat = desc.contains("plat") || id.contains("plat");
            let is_coin = desc.contains("coin") || id.contains("coin");
            is_999 && is_gold && !is_silver && !is_plat && !is_coin && p.ask != "-"
        })
        .filter_map(|p| {
            let ask: f64 = p.ask.parse().ok()?;
            // small retail gram entries are < 100,000; base spot entries are > 100,000 (per 10gm)
            if ask < 100_000.0 { return None; }
            let desc = p.description.to_lowercase();
            if desc.contains("with gst") {
                Some(ask / 1.03)
            } else {
                Some(ask)
            }
        })
        .collect();

    if candidates.is_empty() {
        return LiveRate { rate_999_per_gram: 0.0, rate_22kt_per_gram: 0.0, rate_18kt_per_gram: 0.0, valid: false };
    }

    let lowest = candidates.iter().cloned().fold(f64::INFINITY, f64::min);
    let per_gram = lowest / 10.0;

    LiveRate {
        rate_999_per_gram: per_gram.round() as f64,
        rate_22kt_per_gram: ((920.0 / 999.0) * per_gram).round() as f64,
        rate_18kt_per_gram: ((750.0 / 999.0) * per_gram).round() as f64,
        valid: true,
    }
}

async fn aggregate_gold_price(state: SharedState) {
    let arihant_url = "https://bcast.arihantspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/arihant";
    let safari_url = "https://bcast.safaribullions.in:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/safari";

    loop {
        let (mut arihant, safari, rsbl) = tokio::join!(
            fetch_gold_price(arihant_url),
            fetch_gold_price(safari_url),
            fetch_rsbl_price(),
        );
        arihant.extend(safari);
        arihant.extend(rsbl);
        *state.lock().unwrap() = arihant;
        time::sleep(Duration::from_secs(5)).await;
    }
}

#[get("/live_rate")]
async fn get_live_rate(state: web::Data<SharedState>) -> impl Responder {
    let prices = state.lock().unwrap();
    let rate = adjudicate(&prices);
    HttpResponse::Ok().json(rate)
}

#[get("/gold_price_stream")]
async fn get_gold_price_stream(state: web::Data<SharedState>) -> impl Responder {
    let initial_data = {
        let state = state.lock().unwrap();
        serde_json::to_string(&*state).unwrap()
    };
    let stream = stream! {
        yield Ok::<_, actix_web::Error>(Bytes::from(format!("data: {}\n\n", initial_data)));

        let mut interval = time::interval(Duration::from_secs(1));
        loop {
            interval.tick().await;
            let state = state.lock().unwrap();
            let data = serde_json::to_string(&*state).unwrap();
            yield Ok(Bytes::from(format!("data: {}\n\n", data)));
        }
    };

    HttpResponse::Ok()
        .insert_header(header::ContentType(mime::TEXT_EVENT_STREAM))
        .streaming(stream)
}

#[get("/live_rate_stream")]
async fn get_live_rate_stream(state: web::Data<SharedState>) -> impl Responder {
    let stream = stream! {
        let mut interval = time::interval(Duration::from_secs(1));
        loop {
            interval.tick().await;
            let prices = state.lock().unwrap();
            let rate = adjudicate(&prices);
            let data = serde_json::to_string(&rate).unwrap();
            yield Ok::<_, actix_web::Error>(Bytes::from(format!("data: {}\n\n", data)));
        }
    };

    HttpResponse::Ok()
        .insert_header(header::ContentType(mime::TEXT_EVENT_STREAM))
        .streaming(stream)
}

#[get("/silver_price")]
async fn get_silver_price() -> impl Responder {
    let api_url = "http://bcast.nm1788.net:7767/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/nm1788";
    let response = reqwest::get(api_url).await;
    match response {
        Ok(response) => {
            let body = response.text().await;
            match body {
                Ok(body) => {
                    let lines: Vec<&str> = body.trim().split("\r\n").collect();
                    let mut prices = Vec::new();
                    for line in lines {
                        let parts: Vec<&str> = line.trim().split("\t").collect();
                        if parts.len() >= 6 {
                            prices.push(GoldPrice {
                                id: parts[0].to_string(),
                                source: "nm1788".to_string(),
                                description: parts[1].to_string(),
                                bid: parts[2].to_string(),
                                ask: parts[3].to_string(),
                                low: parts[4].to_string(),
                                high: parts[5].to_string(),
                            });
                        }
                    }
                    HttpResponse::Ok().json(prices)
                }
                Err(_) => HttpResponse::InternalServerError().json(ErrorResponse {
                    error: "Failed to parse response body".to_string(),
                }),
            }
        }
        Err(_) => HttpResponse::InternalServerError().json(ErrorResponse {
            error: "Failed to fetch silver prices".to_string(),
        }),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = Arc::new(Mutex::new(Vec::new()));
    let state_clone = Arc::clone(&state);
    tokio::spawn(async move {
        aggregate_gold_price(state_clone).await;
    });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Arc::clone(&state)))
            .service(get_live_rate)
            .service(get_live_rate_stream)
            .service(get_silver_price)
            .service(get_gold_price_stream)
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
