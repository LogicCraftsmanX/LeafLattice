

# 🌳 LeafLattice – Global Tree & Forest Data Explorer

**TreeScope** is a lightweight, serverless web application that visualizes global tree and forest data on an interactive map. It leverages **AWS Free Tier** for the backend and **Cloudflare Pages** for the frontend, making it cost-effective and scalable.

This project is ideal for demonstrating real-world AWS architecture skills for the **AWS Solutions Architect Associate (SAA)** portfolio.

---

## 🖥️ Live Demo

[Insert your Cloudflare Pages URL here]

---

## 📌 Features

* **Interactive World Map**
  Visualize tree density, forest cover, CO₂ absorption, and species distribution globally.

* **Country & Species Insights**
  Click on a region or search for a species to see detailed environmental statistics.

* **Serverless Backend**
  AWS Lambda + API Gateway serves API requests with DynamoDB as the data store.

* **Global Statistics**
  Quickly view trends like deforestation over the past 5 years.

* **Cost-Effective**
  Built to run on free-tier services, suitable for demo projects or proof-of-concept.

---

## ⚙️ Tech Stack

| Layer          | Technology                                                 |
| -------------- | ---------------------------------------------------------- |
| Frontend       | React / Svelte, Leaflet.js / MapLibre GL, Cloudflare Pages |
| Backend        | AWS Lambda (Node.js/Python), API Gateway HTTP API          |
| Database       | DynamoDB (NoSQL)                                           |
| Infrastructure | AWS SAM or Terraform, CloudWatch logs, IAM roles           |
| Optional       | S3 for static assets, CloudFront CDN                       |

---

## 📂 Project Structure

```
/frontend
  /src
  /components
  /public
/backend
  /src
  /tests
  template.yaml (SAM) or main.tf (Terraform)
/infra
  architecture-diagram.png
  README.md
/data
  seed_dataset.json
/docs
  api-spec.md
```

---

## 🛠️ Installation & Deployment

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/treescope.git
cd treescope
```

### 2. Deploy Backend (AWS)

* Using **SAM**:

```bash
sam build
sam deploy --guided
```

* Or using **Terraform**:

```bash
terraform init
terraform apply
```

### 3. Deploy Frontend (Cloudflare Pages)

* Push `/frontend` to a GitHub repository linked to **Cloudflare Pages**
* Configure build command (`npm run build`) and publish directory (`/dist`)

---

## 🗄️ Database (DynamoDB) Example

**Table: TreeMetrics**

| Partition Key | Sort Key           | Example Value    |
| ------------- | ------------------ | ---------------- |
| COUNTRY#US    | METRIC#FOREST_AREA | 310M hectares    |
| COUNTRY#US    | SPECIES#REDWOOD    | density: 120/km² |
| SPECIES#OAK   | COUNTRY#FR         | density: 80/km²  |

This schema allows efficient queries by country or species.

---

## 🌐 API Endpoints

| Method | Endpoint        | Description                                |
| ------ | --------------- | ------------------------------------------ |
| GET    | /countries      | List all countries with basic forest stats |
| GET    | /country/{code} | Detailed stats for a country               |
| GET    | /species/{name} | Countries and density info for a species   |
| GET    | /stats/global   | Global forest summary                      |

---

## 📈 Cost Estimation

| AWS Service      | Estimated Cost                     |
| ---------------- | ---------------------------------- |
| API Gateway      | ~$0 (low usage)                    |
| Lambda           | Free Tier covers 1M requests/month |
| DynamoDB         | Free Tier (25GB, read/write units) |
| Cloudflare Pages | Free                               |
| S3/CloudFront    | Optional, minimal cost             |

💰 Total: practically free

---

## 📝 Learnings & Skills Demonstrated

* Serverless architecture (Lambda + API Gateway + DynamoDB)
* Cloudflare static site hosting
* IAM least privilege configuration
* Efficient DynamoDB data modeling
* CI/CD deployment using SAM/Terraform
* Monitoring & logging via CloudWatch
* Cost-aware cloud architecture

---

## 📷 Screenshots

*(Add screenshots of your map, popups, and stats here)*

---

## 🔗 References

* [AWS Lambda](https://aws.amazon.com/lambda/)
* [AWS API Gateway](https://aws.amazon.com/api-gateway/)
* [DynamoDB](https://aws.amazon.com/dynamodb/)
* [Leaflet.js](https://leafletjs.com/)
* [Cloudflare Pages](https://pages.cloudflare.com/)
* [OpenTreeMap / Global Forest Watch](https://www.globalforestwatch.org/)

---
