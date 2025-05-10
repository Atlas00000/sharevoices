import autocannon from 'autocannon';
import { logger } from '../../utils/logger';

const BASE_URL = process.env.API_URL || 'http://localhost:3001';

async function runLoadTest() {
    const testCases = [
        {
            name: 'Get All Articles',
            url: `${BASE_URL}/api/content`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'Get Article by ID',
            url: `${BASE_URL}/api/content/123`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        {
            name: 'Get Article Statistics',
            url: `${BASE_URL}/api/content/123/stats`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            }
        }
    ];

    for (const testCase of testCases) {
        logger.info(`Running load test for: ${testCase.name}`);

        const result = await autocannon({
            url: testCase.url,
            method: testCase.method,
            headers: testCase.headers,
            connections: 100,
            pipelining: 1,
            duration: 10,
            timeout: 5
        });

        logger.info(`Results for ${testCase.name}:`);
        logger.info(`Average Latency: ${result.latency.average}ms`);
        logger.info(`Requests/sec: ${result.requests.average}`);
        logger.info(`2xx responses: ${result['2xx']}`);
        logger.info(`Non-2xx responses: ${result.non2xx}`);
        logger.info('-----------------------------------');
    }
}

async function runPerformanceTest() {
    const testCases = [
        {
            name: 'Create Article',
            url: `${BASE_URL}/api/content`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({
                title: 'Performance Test Article',
                content: 'Test content',
                category: 'test',
                tags: ['test'],
                authorId: '1'
            })
        },
        {
            name: 'Update Article',
            url: `${BASE_URL}/api/content/123`,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-token'
            },
            body: JSON.stringify({
                title: 'Updated Performance Test Article',
                content: 'Updated test content'
            })
        }
    ];

    for (const testCase of testCases) {
        logger.info(`Running performance test for: ${testCase.name}`);

        const result = await autocannon({
            url: testCase.url,
            method: testCase.method,
            headers: testCase.headers,
            body: testCase.body,
            connections: 10,
            pipelining: 1,
            duration: 5,
            timeout: 5
        });

        logger.info(`Results for ${testCase.name}:`);
        logger.info(`Average Latency: ${result.latency.average}ms`);
        logger.info(`Requests/sec: ${result.requests.average}`);
        logger.info(`2xx responses: ${result['2xx']}`);
        logger.info(`Non-2xx responses: ${result.non2xx}`);
        logger.info('-----------------------------------');
    }
}

// Run tests
async function runTests() {
    try {
        logger.info('Starting performance and load tests...');
        
        await runLoadTest();
        await runPerformanceTest();
        
        logger.info('Tests completed successfully');
    } catch (error) {
        logger.error('Error running tests:', error);
        process.exit(1);
    }
}

runTests(); 