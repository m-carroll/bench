const axios = require('axios')

export const getPage = async function(page) {
    try {
        return (await axios.get(`https://resttest.bench.co/transactions/${page}.json`)).data
    } catch ({ response, request }) {
        if (!response) {
            console.error(request)
        }
        else if (response.status === 404) {
            console.error(`page ${page} not found, status code 404`)
        } else {
            console.log(`Error: ${response.statusText}; status code ${response.status}`)
        }
    }
}

export const getAllTransactions = async function() {
    const page1 = await getPage(1)
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

export const printRunningTotals = function(transactions) {
    if (!transactions.length) {
        console.log('no transactions found')
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
        console.log(Number(t.Amount))
    }
    console.log(`${date} ${dailyTotal}`)
}

const main = async function() {
    const allTransactions = await getAllTransactions()
    printRunningTotals(allTransactions)
}

main()
