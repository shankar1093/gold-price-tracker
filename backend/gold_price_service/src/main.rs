use actix_web::{get, web, App, HttpServer, HttpResponse, Responder};
use reqwest;
use serde::Serialize;
use std::sync::{Arc, Mutex};
use tokio::time::{self, Duration};
use futures::StreamExt;
use actix_web::http::header;
use async_stream::stream;
use actix_web::web::Bytes;
use mime;

#[derive(Serialize, Debug)]
struct GoldPrice {
    id: String,
    description: String,
    bid: String,
    ask: String,
    low: String,
    high: String,
}

#[derive(Serialize, Debug)]
struct ErrorResponse {
    error: String,
}

type SharedState = Arc<Mutex<Vec<GoldPrice>>>;

async fn fetch_gold_price(state: SharedState) {
    let api_url = "https://bcast.arihantspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/arihant";

    loop {
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
                                    description: parts[1].to_string(),
                                    bid: parts[2].to_string(),
                                    ask: parts[3].to_string(),
                                    low: parts[4].to_string(),
                                    high: parts[5].to_string(),
                                });
                            }
                        }
                        let mut state = state.lock().unwrap();
                        *state = prices
                    }
                    Err(_) => eprintln!("Failed to parse response body"),
                }
            }
            Err(_) => eprintln!("Failed to fetch gold prices from API"),
        }
        time::sleep(Duration::from_secs(5)).await;
    }   
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

#[get("/gold_price")]
async fn get_gold_price() -> impl Responder {
    let api_url = "https://bcast.arihantspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/arihant";
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
            error: "Failed to fetch gold prices from API".to_string(),
        }),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let state = Arc::new(Mutex::new(Vec::new()));
    let state_clone = Arc::clone(&state);
    tokio::spawn(async move {
        fetch_gold_price(state_clone).await;
    });

    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(Arc::clone(&state)))
            .service(get_gold_price)
            .service(get_gold_price_stream)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}