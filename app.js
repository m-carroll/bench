const axios = require('axios')

const getPage = async function(page) {
    try {
        return (await axios.get(`https://resttest.bench.co/transactions/${page}.json`)).data
    } catch ({ response, request }) {
        if (!response) {
            console.error(request)
        }
        else if (response.status === 404) {
            console.error(`page ${page} not found, status code 404`)
        } else {
            console.error(`Error: ${response.statusText}; status code ${response.status}`)
        }
    }
}

const getAllTransactions = async function() {
    const page1 = await getPage(1)
    if (!page1 || !page1.transactions.length) {
        console.error('no results found')
        return []
    }
    const { totalCount } = page1
    const totalPages = Math.ceil(totalCount / 10)
    const promises = [Promise.resolve(page1)]
    for (let page = 2; page <= totalPages; page++) {
        promises.push(getPage(page))
    }
    const allPages = (await Promise.all(promises)).filter(p => !!p)
    const allTransactions = allPages.reduce((acc, curr) => [...acc, ...curr.transactions], [])
    allTransactions.sort((a, b) => new Date(a.Date) - new Date(b.Date))
    return allTransactions
}

const printRunningTotals = function(transactions) {
    if (!transactions.length) {
        console.error('no transactions found')
        return
    }
    let date = transactions[0].Date
    let dailyTotal = 0
    for (const t of transactions) {
        if (t.Date !== date) {
            console.log(`${date} ${dailyTotal}`)
            date = t.Date
        }
        dailyTotal = Math.round((dailyTotal + Number(t.Amount)) * 100) / 100 // to get around floating point imprecision
    }
    console.log(`${date} ${dailyTotal}`)
}

module.exports = {
    getPage,
    getAllTransactions,
    printRunningTotals,
}
