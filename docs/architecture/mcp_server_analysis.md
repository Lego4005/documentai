# MCP Server Analysis

## Overview

This document analyzes the architecture and connection mechanisms of the Supabase MCP server, based on the design document `supabase-mcp-server.md` and other system documentation.

## Architecture

The MCP server is designed to store and retrieve chat analytics data. It uses the `@modelcontextprotocol/sdk` and the Supabase client library (with `pgvector`).

### Request/Response Flow

1.  **Input:** Clients send requests to the server using the Model Context Protocol. Requests include `store_chat` and `query_chats`.
2.  **Processing:**
    *   The server validates incoming requests.
    *   For `store_chat` requests, the server stores chat data (text, sender, timestamp, and optionally embeddings) in the Supabase database.
    *   For `query_chats` requests:
        *   The server constructs a query to the Supabase database based on the provided input parameters.
        *   If `query_embedding` is provided, the server uses Supabase's `pgvector` extension to perform a similarity search.
        *   The server retrieves matching chat records from the database.
3.  **Output:** `chats` (Chat[] - an array of matching chat objects).

## Data Model

The `Chat` object has the following structure:

*   `id`: `string` (UUID)
*   `timestamp`: `number` (Unix timestamp)
*   `sender`: `string`
*   `text`: `string`
*   `embedding`: `number[]` (optional)

## Error Handling

The server is designed to return appropriate MCP error responses for invalid requests or database errors.

## Security

*   Access to the MCP server is restricted.
*   Sensitive data (API keys, credentials) are stored securely.

## Purpose and Connections

**Purpose:**

The Supabase MCP server is a component within a larger system (likely the "Memory Bank System") designed to store and retrieve chat analytics data. Its primary purpose is to provide a persistent storage and query interface for chat messages, leveraging vector embeddings for similarity-based searches. This enables the system to analyze chat history, identify relevant conversations, and potentially provide context-aware features. The "tools" it uses are the `@modelcontextprotocol/sdk` for MCP server creation and communication, and the Supabase client library (with `pgvector`) for database interaction.

**Connections:**

1.  **Clients:** Clients, which could be any application needing to store or analyze chat data, connect to the MCP server using the Model Context Protocol. The exact transport mechanism is unspecified but is typically message-based.

2.  **Supabase Database:** The MCP server connects to a Supabase database instance. This connection is established using the Supabase client library, likely with API keys and credentials managed securely. The database stores chat data, including text, sender, timestamp, and vector embeddings. The `pgvector` extension enables similarity searches.

3.  **Embedding Model (External):** The MCP server *may* connect directly to an external embedding service (like OpenAI's API) to generate embeddings for incoming chat messages. Alternatively, embedding generation might be handled by a separate component within the larger system, and the embeddings would be provided to the MCP server as part of the `store_chat` request.

4.  **Other Internal Components (Speculative):** Given the references to "Memory Bank System," "Tracking System," and "Template System" in `systemPatterns.md`, it's likely that the MCP server interacts with other internal components. These components might be responsible for:

    *   **Memory Bank System:** Managing the overall context and potentially using the chat data stored by the MCP server.
    *   **Tracking System:** Monitoring the performance and usage of the MCP server and other parts of the system.
    *   **Template System:** Providing templates for chat messages or other data structures.

    The exact nature of these interactions is unclear without further documentation. The "❌ MCP Server Not Detected" status in `productContext.md` suggests that the integration between these components is not yet complete.