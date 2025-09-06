# MCP-RAG-BRIDGE

📌 **Demo Overview**

Hands-on demo of AI orchestration with LLMs and MCP servers, fully local setup.

This repository is part of a larger demo showcasing how to combine:

- Real-time or sample data and proprietary documents (e.g., specifications, promotions, warranties).
- The vast knowledge and reasoning abilities of a Large Language Model (LLM).
- MCP Servers, which securely provide data and documents to the AI Agent.

Together, these components demonstrate how an AI Agent can orchestrate across multiple sources to generate deep insights — for example, identifying new product bundles or designing targeted promotions.

👉 This repo is one of several components that make up the full demo.
👉 The attached [PDF Guide](https://github.com/AsifRajwani/MCP-Server/blob/main/AI%20Agent%20MCP%20Demo.pdf) details all the setup required to run all components locally on your personal computer.

## Dependency

This project relies on the REST API provided by the RAG Service: [https://github.com/AsifRajwani/RAG-service](https://github.com/AsifRajwani/RAG-service).

**Important:** Ensure that the RAG Service is running and that documents have been ingested before using this bridge.

# How to Run and Test the MCP Server

# Requirements

This project requires **Node.js version 22.15.x or above** (download from https://nodejs.org/).

## Setup and Installation

1.  **Clone the repository:** Clone the GitHub repository to your local machine using the command:

    ```bash
    git clone https://github.com/AsifRajwani/MCP-RAG-Bridge.git
    ```

2.  **Navigate to the directory:** Change your current directory to the project folder:

    ```bash
    cd MCP-RAG-Bridge
    ```

3.  **Install dependencies:** Install all the required packages by running:

    ```bash
    npm install
    ```

    This command will create a `node_modules` directory in your project.

---

## Compiling and Running the Server

1.  **Compile the code:** Build the project by running the following command and ensure there are no errors:

    ```bash
    npm run build
    ```

2.  **Start the server:** Run the server with this command. The server uses `StdioServerTransport`, so there won't be much interactive output in the terminal.

    ```bash
    npm run start
    ```

---

## Testing with the Inspector

To properly test your code, use the **MCP Inspector**. It will start the server in its own subprocess and provide a robust web interface for testing all the available methods.

- **Run the Inspector:** From your terminal, execute the following command:

  ```bash
  npx @modelcontextprotocol/inspector node dist/rag-mcp-bridge.js
  ```

The inspector will launch a web UI in your browser, allowing you to interact with and debug the server.
