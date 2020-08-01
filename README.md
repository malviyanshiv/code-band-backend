# code-band-backend

<!-- [START badges] -->

[![Build Status](https://travis-ci.com/malviyanshiv/code-band-backend.svg?branch=master)](https://travis-ci.com/malviyanshiv/code-band-backend) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

<!-- [END badges] -->

This is a simple REST API developed using node and express with javascript.

<!-- [START requirements] -->

## Requirements

-   Node and npm
-   MongoDB

<!-- [END requirements] -->

<!-- [START getstarted] -->

## Getting Started

### Installation

1. Clone the repo locally :
    ```
    git clone https://github.com/malviyanshiv/code-band-backend.git
    ```
2. Install dependencies :
    ```
    npm install
    ```

### Run

1. Setup environment varaibles : Create configuration file **config/dev.env** and set variables
    ```
    PORT=3000
    MONGODB_URL=mongodb://127.0.0.1:27017/code-band-api
    JWT_SECRET=thisislocalkey
    ```
2. Run the server in dev mode
    ```
    npm run dev
    ```
  <!-- [END getstarted] -->

## Resources

-   [API Documentation](https://documenter.getpostman.com/view/7656573/T1DjjzBz?version=latest)

## Contributing to API

We strongly encourage you to join us in contributing to this repository so everyone can benefit from :

-   New features and functionality
-   Resolved bug fixes and issues
-   Any general improvements

Follow these simple steps

1.  Fork it ([https://github.com/malviyanshiv/code-band-backend](https://github.com/malviyanshiv/code-band-backend))
2.  Create your feature branch (`git checkout -b feature/fooBar`)
3.  Commit your changes (`git commit -am 'Add some fooBar'`) Please make sure your commit should prefix your template name so that it can easily be tracked.
4.  Push to the branch (`git push origin feature/fooBar`)
5.  Create a new Pull Request

## Licence

MIT license. For more information, see the LICENSE file.
