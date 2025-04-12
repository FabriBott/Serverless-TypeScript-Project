# Serverless TypeScript Project

This project is a serverless application built with TypeScript, utilizing AWS services. It demonstrates how to create AWS Lambda functions with middleware and a repository layer.

## Project Structure

```
svlesstemplate
├── src
│   ├── handlers
│   │   ├── getUserBalanceHandler.ts
│   │   └── paymentHandler.ts
│   ├── middleware
│   │   ├── authMiddleware.ts
|   │   ├── iMiddleware.ts
|   │   ├── loggerMiddleware.ts
|   │   ├── middleWareManager.ts
|   │   └── validateUserRequestsMiddleware.ts
│   ├── repository
│   │   ├── paymentRepository.ts
|   │   └── userRepository.ts
│   ├── service
│   │   ├── logger.ts
│   │   ├── paymentService.ts
│   │   └──userService.ts
│   └── utils
│       └── logger.ts
├── tests \ handler
|   ├── getUserBalanceHandler.test.ts
|   └── paymentHandler.test.ts
├── .env
├── jest.config.js
├── serverless.yml
├── package.json
├── tsconfig.json
└── README.md
```

## Prerequisites

- Node.js (v14.x or later)
- AWS CLI configured with your credentials
- Serverless Framework installed globally (`npm install -g serverless`)

## Setup Instructions

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd svlesstemplate
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory and add your AWS credentials and any other necessary configuration settings.

4. **Compile TypeScript**:
   Ensure TypeScript is compiled before running or deploying:
   ```bash
   npm run build
   ```

## Local Execution

To test the Lambda functions locally, you can use the Serverless Framework's offline plugin. First, install the plugin:

```bash
npm install serverless-offline --save-dev
```

Then, add the following to your `serverless.yml` under `plugins`:

```yaml
plugins:
  - serverless-offline
  - serverless-plugin-typescript
```

Then, add the following to your `package.json` under `dependencies`:

```json
   "dependencies": {
    "aws-lambda": "^1.0.7",
   }
```

Now you can run the application locally:

```bash
serverless offline
```

## Deployment to AWS

To deploy the application to AWS, run the following command:

```bash
serverless deploy
```

## Fixes & Adjustments

During development, the following issues were encountered and resolved:
1. TypeScript Compilation & Module Resolution

    Issue: 502 Bad Gateway and Cannot find module 'src/handlers/…' when invoking Lambdas
    
    Cause: Serverless was pointing to uncompiled .ts files
    
    Fix: Install serverless-plugin-typescript, and added it to the serverless.yml on plugins

2. Compatibility error with the middleware and Lambda

    Issue: The original middleware used next() which is unsupported in Lambda
    
    Cause: Middleware pattern not compatible with Lambda
    
    Fix: Refactor exampleMiddleware to process the event and return it:

    ```ts
    export const exampleMiddleware = async (event: any) => {
      console.log('Middleware processing:', event);
      if (!event.body) throw new Error('No body');
      event.processed = true;
      return event;
    };
    ```

3. error in the Try-Catch

    Issue: the error message caused an error in th catch block
    
    Cause: TypeScript treats errors as unknown
    
    Fix: Add a type check:

    ```ts
    } catch (error: unknown) {
      if (error instanceof Error) {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: error.message }),
        };
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unknown error' }),
      };
    }

    ```

4. Parsing the HTTP request body

    Issue: the data sent in the json on the POST appeared as undefined when recieved via Serverless Offline

    Cause: event.body wasnt parsed from string
    
    Fix: manually parse body:

    ```ts
    const body = typeof event.body === 'string'
      ? JSON.parse(event.body)
      : event.body;

    const { userId, cardNumber, ... } = body;

    ```

5. Error in serverless deployment

    Issue: when runnig serverless deploy it sent an error of credentials

    Cause: on the .env where AWS keys and other information that shouldnt be there

    Fix: delete on the .env the reference of AWS keys and related

6. Middleware Authorization Failure (502 Unauthorized)

    Issue: Getting 502 Unauthorized when invoking a Lambda with middleware

    Cause: The authMiddleware was expecting a valid Authorization header, but it was missing or not parsed

    Fix: Hardcoded token in authMiddleware for testing purposes, and improved error handling

7. Chaining Middleware Execution

    Issue: Need to allow chaining of multiple middleware

    Cause: No structure in place to enforce required middleware

    Fix: Implemented middlewareManager (chain of responsibility pattern). push middlewares into an array and execute them in a sequence.
  
      ```ts
      for (const middleware of this.middlewares) {
        event = await middleware.execute(event);
      }
      ```

8. Design pattern for the middleware

    Issue: some middleware shouldnt be optional (like the authMiddleware)

    Cause: All middleware were treated equally, without distinction between optional and required

    Fix: Authentication middleware was always inserted first in the chain and executed before others. If it throws, the chain is stopped, enforcing its required status.


## POC

POC Step 1: Handler Responsibilities (SOLID & Cohesion Principle)

    Challenge:
    Handlers in the original template mixed the business logic and data, and accesing repositories directly, that led leading to low cohesion and hard-to-maintain code

    Solution:

        Split responsibilities into two distinct handlers:

            getUserBalanceHandler for checking balance and initiating payment

            paymentHandler for processing card payments

        Introduced a service layer (UserService, PaymentService, logger) that encapsulates business logic and interacts with repositories

    Advantages over Original Template:

        Clearer responsibilities: Each handler now has a single task, better defined

        Decoupling: Handlers no longer access repositories directly, making testing and other aspects like scalability easier

        Maintainability: Future changes in business logic or data sources only affect the service layer, not the handlers

POC Step 2: README.md Fixes & Adjustments

    Challenge:
    Original README lacked documentation of deployment issues and fixes, causing confusion around Serverless configuration and AWS permissions

    Solution Chosen:

        Updated the README to include:

            A list of encountered errors (reserved environment variables, IAM permission issues)

            Step by step fixes applied (e.g., removing AWS keys from .env, adding serverless-plugin-typescript, adjusting provider.environment)

            Clearer and better instructions

    Advantages over Original Template:

        Reproducibility: easier to clone and run

        Transparency: Common errors are documented.

        Onboarding speed: Reduced time to first success for team members

POC Step 3: Logger Improvements (Design Pattern Required)

    Challenge:
    The template used only console.log, which was unsuitable for production serverless apps (no persistence, no configurable destinations, etc)

    Solution Chosen:

        Defined a Logger interface and two implementations:

            ConsoleLogger (for local developement)

            CloudWatchLogger (writes to AWS CloudWatch)

        Applied the Strategy Pattern so the logger can be swapped based on NODE_ENV.

    Advantages over Original Template:

        Environment specific logging: Development logs can stay local, and production logs persist in CloudWatch

        Extensibility: new logger implementations can be added without changing handlers

        Better observability: new logs improve monitoring and debugging

POC Step 4: Optional & Mandatory Middleware (Design Pattern Required)

    Challenge:
    The original template didnt have a structured middleware system. All middleware were optional or hardwired, and authentication wasnt guaranteed, so create a new structure and replace the old one was tricky

    Solution Chosen:

        Created witMiddleware functions using the Chain of Responsibility Pattern.

        Allowed separation of mandatory middlewares (authMiddleware) from optional ones (loggerMiddleware)

        Each middlewares execute() either throws an error or passes control to the next.

    Advantages over Original Template:

        Flexible chaining: Easily manipulate middlewares (add, modify and delete).

        Enforced authentication: non optional middleware always runs first, to avoid unauthorized access

        Modularity: Each middleware focuses on a single task (auth, validation, logging)

POC Step 5: Repository Layer Improvements (Decoupling & Reusability)

    Challenge:
    Handlers accessed repositories directly, mixing data with business. No multiple data sources or swapping of repositories

    Solution Chosen:

        Introduced a service layer (UserService, PaymentService, logger) between handlers and repositories

        Repositories remain simple data access classes, while services handle business rules

    Advantages over Original Template:

        Decoupling: Business logic and data are now separated

        Reusability: Services can be reused in othe contexts

        Testability: repositories con mock in tests without touching handlers

POC Step 6: Deployment & Testing

    Challenge:
    The original template had no automated tests or DB cloud integration.

    Solution Chosen:

        Implemented two unit test functions (with Jest), to simulate APIGatewayProxyEvent and its context

        services were configurated to read from simulated cloud database (repos in memory).

        a Postman collection with two requests for the live endpoints (/example-one, /example-two), including headers and bodies

    Advantages over Original Template:

        testing: handler logic remains correct during changes

        Cloud integration: Services already structured to connect to real cloud databases

        Easy testing: Postman collection lets developers quickly validate the deployed API


