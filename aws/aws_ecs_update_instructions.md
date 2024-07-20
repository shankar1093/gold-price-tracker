
# AWS ECS Update Instructions for t2.micro EC2 Instance

This document provides step-by-step instructions to manually update your ECS service running on a t2.micro EC2 instance with low memory and storage. The following steps ensure that the update process does not run out of memory.

## Prerequisites
- Ensure you have SSH access to your EC2 instance.
- Docker must be installed on the EC2 instance.
- AWS CLI must be configured on your local machine.

## Steps

### 1. SSH into EC2 Instance
First, SSH into your EC2 instance using the appropriate credentials.

```sh
ssh -i /path/to/your-key.pem ec2-user@your-ec2-instance-public-dns
```

### 2. Stop Running Docker Containers
Stop the running frontend and backend Docker containers.

```sh
sudo docker stop frontend_container_name
sudo docker stop backend_container_name
```

Replace `frontend_container_name` and `backend_container_name` with the actual names of your frontend and backend containers.

### 3. Delete Docker Images
Remove the Docker images to free up space.

```sh
sudo docker rmi frontend_image_name
sudo docker rmi backend_image_name
```

Replace `frontend_image_name` and `backend_image_name` with the actual names of your frontend and backend images.

### 4. Update ECS Service
Use the AWS CLI to update the ECS service. This can be done from your local machine where AWS CLI is configured.

```sh
aws ecs update-service --cluster your-cluster-name --service your-service-name --force-new-deployment
```

Replace `your-cluster-name` and `your-service-name` with the appropriate ECS cluster and service names.

## Summary
1. SSH into your EC2 instance.
2. Stop the running frontend and backend containers.
3. Delete the Docker images for the frontend and backend.
4. Update the ECS service using the AWS CLI to force a new deployment.

This manual process ensures that you do not run out of memory during the update.

## Additional Information

- **SSH Command:** Ensure you have the correct path to your `.pem` file and the public DNS of your EC2 instance.
- **Stopping Containers:** You can find the names of running containers by executing `sudo docker ps` on the EC2 instance.
- **Removing Images:** Use `sudo docker images` to list all Docker images and identify the ones to remove.
- **AWS CLI Update Service:** Ensure you have the necessary permissions to update the ECS service. 

## Troubleshooting

- **Insufficient Permissions:** If you encounter permission issues, ensure your IAM role has the necessary permissions to perform the update.
- **Memory Issues:** If memory issues persist, consider upgrading your EC2 instance to a larger type.

For any further assistance, refer to the [AWS ECS Documentation](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html).

---

By following these steps, you can manually manage the ECS updates on a low-memory t2.micro instance without running into memory constraints.
