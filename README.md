# A Leakage-Aware Deep Learning Framework for Reliable Chest X-ray Classification 
*Conference paper (MAPR 2026, Scopus-indexed)*

[![PyTorch](https://img.shields.io/badge/PyTorch-1.x-ee4c2c.svg)](https://pytorch.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Authors:** Ly Yen Nguyen-Thi, Linh To Tran, Thien B. Nguyen-Tat
> **Institution:** University of Information Technology, VNU-HCM
> **DOI:** 10.1109/mapr72750.2026.11685789

## Overview:
This repository contains the implementation of a deep learning framework designed for the reliable multi-class classification of Chest X-rays (CXR). Our work addresses two critical issues in medical image analysis: **data leakage** and **model interpretability**.
## Graphical Abstract:
<img width="567" height="769" alt="Graphical abstract" src="https://github.com/user-attachments/assets/61b1fe98-4657-432b-8eb3-36bb3dad7bf4" />


**Key Contributions:**
*   **Leakage-Aware Pipeline:** We implemented a rigorous data deduplication process using MD5 and Perceptual Hashing (pHash) *before* splitting the dataset. This ensures no duplicate or near-duplicate images inflate the evaluation metrics across training, validation, and test sets.
*   **Anatomically Constrained Explainability:** We run a parallel **U-Net** model to extract precise lung masks. These masks are used to constrain the **Grad-CAM++** visual explanations, forcing the model to highlight only pulmonary regions and eliminating spurious background attention.
*   **High Performance:** Utilizing an **EfficientNet-B0** backbone, the classification model achieves **95.57% accuracy** and a **96.74% macro-F1 score** across four categories: COVID-19, Lung Opacity, Viral Pneumonia, and Normal. The U-Net segmentation achieved a **0.9861 Dice coefficient**.
## Architecture:
<img src="https://github.com/user-attachments/assets/7128bade-5a46-4647-9b29-4f8651d7d0a4" style="background-color: white; padding: 10px; border-radius: 5px;" />

## How to Run the Frontend Interface

1. **Install Dependencies:** `npm install` (or `yarn install`)
2. **Run Development Server:** `npm run dev` (or `yarn dev`)
3. **Access UI:** Open [http://localhost:3000](http://localhost:3000) in your browser.

*(Note: Ensure the Backend API server is running concurrently to handle upload requests).*
This repository contains the backend code for deploying the web-based diagnostic system (as described in Section VI of our paper).

## Repository Structure (Frontend)
This repository contains the Next.js/React frontend code for the web-based diagnostic interface.

```text
├── public/                 # Static assets (images, icons)
├── src/                    # Main source code
│   ├── app/                # Next.js App Router (pages, layouts, routing)
│   ├── components/         # Reusable React UI components
│   ├── features/           # Feature-specific modules and business logic
│   └── lib/                # Utility functions, helpers, and API clients
├── next.config.ts          # Next.js configuration settings
├── package.json            # Project dependencies and npm scripts
└── README.md



