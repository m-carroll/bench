const { expect } = require('chai')
const axios = require('axios')
const sinon = require('sinon')
const {
    getPage,
    getAllTransactions,
} = require('./app')

describe('index.js', function() {
    let axiosStub = sinon.stub()
    afterEach(function() {
        axiosStub.restore()
    })
    describe('getPage', function() {
        // these tests are delicate because they rely on an unchanging api result. Bad!
        it('should load valid pages', async function() {
            axiosStub = sinon.stub(axios, 'get').resolves({ data: {transactions: 'some fake transactions' } })
            const page = await getPage(1)
            expect(page.transactions).to.eql('some fake transactions')
            expect(axiosStub.callCount).to.eql(1)
        })
        it('should return nothing when a valid page is not loaded', async function() {
            axiosStub = sinon.stub(axios, 'get').rejects({ response: { status: 404} })
            const page = await getPage(1)
            expect(page).to.eql(undefined)
            expect(axiosStub.callCount).to.eql(1)
        })
    })
    describe('getAllTransactions', function() {
        it('should return nothing when no transactions are found on page 1', async function() {
            axiosStub = sinon.stub(axios, 'get').resolves({ data: { transactions: [] } })
            expect((await getAllTransactions()).length).to.eq(0)
        })
        it('should return a list of transactions from multiple pages', async function() {
            axiosStub = sinon.stub(axios, 'get')
            axiosStub
                .withArgs('https://resttest.bench.co/transactions/1.json')
                .resolves({ data: { totalCount: 30, transactions: [{ name: 't1' }] } }) //totalcount here is set to load 3 pages arbitrarily
            axiosStub
                .withArgs('https://resttest.bench.co/transactions/2.json')
                .resolves({ data: { transactions: [{ name: 't2' }, { name: 't3' }] } })
            axiosStub
                .withArgs('https://resttest.bench.co/transactions/3.json')
                .resolves({ data: { transactions: [{ name: 't4' }, { name: 't5' }] } })
            expect((await getAllTransactions()).length).to.eq(5)
            expect((await getAllTransactions())[2]).to.deep.eq({ name: 't3' })
        })
    })
})
