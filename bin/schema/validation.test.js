const { schema } = require('./validation');

describe('Login schema validation', () => {
    it('should return a valid object with user and password', async () => {
        const validObj = { user: 'syngentaAPIs', password: 'yxf6qn7B8QSRBckx' };
        const result = await schema.validateAsync({ user: 'syngentaAPIs', password: 'yxf6qn7B8QSRBckx' });

        //expect(result).toEqual({ user: 'syngentaAPIs', password: 'yxf6qn7B8QSRBckx' });
        expect(result).toMatchObject(validObj);
    });
});