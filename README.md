# Gold and Silver Price Tracking Application

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
`make dev-up`

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

Refer to the Makefile for all the available commands that will help in developing and testing every individual image of this application

Deployment

Refer to `.github/workflows/deploy.yml` for details regarding how when the main branch is updated gh actions will push the new images to ecr and then ecs will deploy those images to an ec2 instance. 

Application Flow

The scheduled task in aws eventbrdige will start the ec2 instance, after 15 minutes a cron job in the ec2 instance will spin up the `static` image and push a static build to cloudfare pages. Fifteen minutes later a scheduled task will run the stopec2 lambda that will shut down the ec2 instance
