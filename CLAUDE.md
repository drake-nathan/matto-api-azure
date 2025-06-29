# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` - Start development environment (runs Azurite storage emulator + Azure Functions)
- `npm run start` - Start Azure Functions runtime (requires build first)
- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode TypeScript compilation

### Testing

- `npm test` - Run Jest tests
- Test files are excluded from `dist` directory

### Code Quality

- `npm run lint` - Run ESLint with zero warnings policy
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking without emitting files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run prettify` - Run both format and lint

### Storage

- `npm run azurite` - Start Azurite storage emulator independently

## Architecture Overview

This is an Azure Functions API for a blockchain-based generative art platform that manages NFT projects, tokens, and metadata.

### Core Components

**Azure Functions Structure**: Each top-level directory (except `src/`) represents an Azure Function:

- HTTP triggers for API endpoints (GetProject, GetToken, etc.)
- Timer triggers for background processing (TransactionListener, ReconcileProjects, etc.)
- Each function has its own `function.json` configuration

**Database Layer** (`src/db/`):

- MongoDB via Mongoose with connection factory pattern
- Schemas for Projects, Tokens, Transactions, Thumbnails, LevelSnapshots
- Query modules for each entity type

**Projects System** (`src/projects/`):

- Multi-chain NFT project support (Ethereum mainnet/testnet)
- Project-specific ABIs and smart contract interactions
- Each project has unique metadata handling and processing logic
- Support for various token standards and rendering types (p5.js, SVG, Solidity-based)

**Web3 Integration** (`src/web3/`):

- Multi-provider blockchain interaction (mainnet/testnet)
- Smart contract event fetching and processing
- Transaction monitoring and processing

**Helpers & Services**:

- `src/helpers/`: Business logic for projects, tokens, transactions
- `src/services/`: External service integrations (Azure Storage, Puppeteer, OpenSea)
- `src/utils/`: Shared utilities and type checking

### Key Features

**Multi-Project Support**: Handles 10 different NFT projects including Chainlife, Mathare Memories, BLONKS, etc.

**Blockchain Awareness**: Tokens respond to on-chain events and ownership changes

**Media Generation**: Uses Puppeteer for dynamic image/video generation from generative scripts

**Azure Integration**: Blob storage for media files, Application Insights for logging

## Environment Setup

- Requires Node.js 20+
- Uses Azurite for local Azure Storage emulation
- Environment variables in `.env` file (DB_CONNECTION_STRING required)
- Azure Functions Core Tools for local development

## Code Style

- Uses `js-style-kit` ESLint configuration
- TypeScript with strict mode enabled
- Prettier for code formatting
- Jest for testing with Babel preset for TypeScript

## Important Notes

- Functions have 10-minute timeout configured
- Some functions are bulk operations (e.g., ReconcileProjects processes all projects)
- Heavy use of blockchain event processing and smart contract interactions
- Media files stored in Azure Blob Storage with organized structure
