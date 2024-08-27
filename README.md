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

## Updating the Frontend and Backend Versions

To update the versions of the frontend and backend services, follow these steps:

1. **Connect to the EC2 Instance**:
   - Use SSH to connect to your EC2 instance where the Docker containers are running.

   ```sh
   ssh -i your-key.pem ec2-user@your-ec2-instance-ip
   ```

2. **Stop the Running Docker Container**:
   - List the running containers to find the relevant ones.

   ```sh
   docker ps
   ```

   - Stop the running containers.

   ```sh
   docker stop <container_id>
   ```

3. **Remove the Docker Images**:
   - Remove the existing Docker images for the frontend and backend.

   ```sh
   docker rmi <frontend_image_name>
   docker rmi <backend_image_name>
   ```

4. **Force Update the Service from the ECS Console**:
   - Go to the AWS Management Console and navigate to the ECS service.
   - Select your cluster and then the service you want to update.
   - Click on the "Update" button and choose "Force new deployment" to apply the changes.

5. **Verify the Update**:
   - After the deployment is complete, check the logs and ensure that the new versions are running correctly.

**Note:** The above update process is temporary. We aim to automate the version update procedure in the future to streamline deployments and reduce manual intervention.
