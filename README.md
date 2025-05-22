# BJIT Crypto: ERC-20

Welcome to the BJIT CRYPTO ERC20 project, a foundational template to guide you through the creation and deployment of an ERC20 token using Hardhat and TypeScript.

## Project Structure

- **Contracts**: The directory where the ERC20 contract is specified.
- **Scripts**: Includes scripting for deployment and potential interaction with the network.
- **Tests**: Contains TypeScript tests to validate the functionality of your smart contract.

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (>=12.x)
- npm (>=6.x)
- Hardhat (Latest version)

## Installation

Clone the repository and install required dependencies:

```shell
npm install
```

## Project Features

- **Hardhat**: A powerful development environment that makes it easy to compile, deploy, test, and debug Ethereum software.
- **TypeScript Integration**: Leverages the benefits of static typing and features specific to TypeScript for enhanced development experience.
- **ERC20 Contract**: A standard token contract based on Ethereum's ERC20 specification.

## Usage

### Compile the Smart Contract

Compile the smart contract using Hardhat's built-in compile functionality:

```shell
npx hardhat compile
```

### Running Tests

Use the following command to run the unit tests and verify the behavior of your smart contract:

```shell
npx hardhat test
```

For gas reporting during tests, use:

```shell
REPORT_GAS=true npx hardhat test
```

### Deploying the Contract

You can deploy your ERC20 contract using Hardhat scripts. First, ensure your configuration is set up for the network you wish to deploy to in `hardhat.config.ts`.

To deploy using the ignition module:

```shell
npx hardhat ignition deploy ./ignition/modules/BJIT_CRYPTO_ERC20.ts --network networkName
```

For local testing, start a Hardhat node:

```shell
npx hardhat node
```

## Configuration

Configure the deployment and network settings in `hardhat.config.ts`. Ensure your contract address, gas limit, and network keys are accurately set here for secure and successful deployment.

Before running scripts or deploying to live/test networks, create a `.env` file in the project root and export all the variables listed in `.env.example`. This ensures your environment variables (such as private keys, RPC URLs, and contract addresses) are securely loaded and available for your Hardhat configuration and scripts.

## License

This project is licensed under the [MIT License](./LICENSE).
