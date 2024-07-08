# Use the official Rust image with Ubuntu 22.04 as a builder
FROM rust:latest AS builder

# Install necessary libraries for building
RUN apt-get update && apt-get install -y libssl-dev

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the Cargo.toml and Cargo.lock files
COPY Cargo.toml Cargo.lock ./

# Copy the source code
COPY src ./src

# Build the project
RUN cargo build --release

# Use Ubuntu 22.04 for the final container
FROM ubuntu:22.04

# Install necessary libraries for runtime
RUN apt-get update && apt-get install -y libssl3 ca-certificates

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/app/target/release/gold_price_service /usr/local/bin/gold_price_service

# Expose the port the app runs on
EXPOSE 8080

# Run the binary
CMD ["gold_price_service"]