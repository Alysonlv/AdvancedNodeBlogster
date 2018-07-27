const Page = require('./helpers/page');

let page;
let dateTestContent = Date.now().toString();

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog create form', async () => {
        const text = await page.getContentsOf('form label');
        expect(text).toEqual('Blog Title');
    });

    describe('And using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', dateTestContent);
            await page.type('.content input', dateTestContent);

            await page.click('form button');
        });

        test('Submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toEqual(dateTestContent);
            expect(content).toEqual(dateTestContent);
        });
    });

    describe('And using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the form show an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('User is not logged in', async () => {
    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: { title: 'My Title', content: 'My Content'}
        }
    ];

    test('and blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    });
});