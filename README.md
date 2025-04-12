# Serverless TypeScript Project

This project is a serverless application built with TypeScript, utilizing AWS services. It demonstrates how to create AWS Lambda functions with middleware and a repository layer.

## Project Structure

```
svlesstemplate
├── src
│   ├── handlers
│   │   ├── exampleHandlerOne.ts
│   │   └── exampleHandlerTwo.ts
│   ├── middleware
│   │   └── exampleMiddleware.ts
│   ├── repository
│   │   └── exampleRepository.ts
│   └── utils
│       └── logger.ts
├── .env
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

