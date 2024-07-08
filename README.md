# Gold Price Tracking Application

This web application is designed for retail stores to display the most up-to-date prices of 22kt and 24kt gold to consumers.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Setup Instructions

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-repo/gold-price-tracker.git
   cd gold-price-tracker
   ```
2.	Build and run the application:
This command will build the frontend and backend images and run them as Docker services.
`docker-compose up --build`

3.	Access the application:
Once the application is running, you can access it in your web browser at: `http://localhost:8080`


Project Structure

* frontend/: Contains the frontend code.
* backend/: Contains the backend code, including the Rust service for fetching and serving gold prices.
* docker-compose.yml: Docker Compose configuration file for setting up the multi-container application.
* Makefile: Contains commands for building and managing the Docker images.

API Endpoints

* GET /gold_price: Fetches the current gold prices.
* GET /gold_price_stream: Provides a stream of updated gold prices.

Development 

Running the backend locally

To run the backend service locally without Docker:

1.	Navigate to the backend directory:
```sh
cd backend/gold-price-service
```
2. Install dependencies and run the service:
```sh
cargo run
```

Running the frontend locally

To run the frontend service locally without Docker:

1.	Navigate to the frontend directory:
```sh
cd frontend
```
2.Install dependencies and run the development server:
```sh
npm install
npm start
```
