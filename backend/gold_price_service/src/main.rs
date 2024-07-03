use actix_web::{get, web, App, HttpServer, Responder, HttpResponse};
use reqwest;
use serde::Serialize;
use std::collections::HashMap;

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
                    error: "Failed to read response body".to_string(),
                }),
            }
        }
        Err(_) => HttpResponse::InternalServerError().json(ErrorResponse {
            error: "Failed to fetch data from API".to_string(),
        }),
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .service(get_gold_price)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}