// src/service/logger.ts
import CloudWatchLogs from 'aws-sdk/clients/cloudwatchlogs';

export interface Logger {
    log(message: string): Promise<void>;
}


export class ConsoleLogger implements Logger {
    async log(message: string): Promise<void> {
        console.log(`[Console] ${message}`);
    }
}


export class CloudWatchLogger implements Logger {
    private cloudWatch: CloudWatchLogs;
    private logGroupName = '/svless-template/logs';
    private logStreamName = 'app-stream';
    private sequenceToken?: string;

    constructor() {
        this.cloudWatch = new CloudWatchLogs({ region: process.env.AWS_REGION || 'us-east-2' });
    }

    async log(message: string): Promise<void> {
        // Asegúrate de crear el grupo y stream si no existen (puedes agregar lógica adicional aquí si lo deseas)
        const logEvents = [
            {
                message,
                timestamp: Date.now(),
            },
        ];

        const params: CloudWatchLogs.Types.PutLogEventsRequest = {
            logGroupName: this.logGroupName,
            logStreamName: this.logStreamName,
            logEvents,
            sequenceToken: this.sequenceToken,
        };

        try {
            const response = await this.cloudWatch.putLogEvents(params).promise();
            this.sequenceToken = response.nextSequenceToken;
        } catch (error) {
            console.error('Error logging to CloudWatch:', error);
        }
    }
}
