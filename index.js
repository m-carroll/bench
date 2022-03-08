const {
    getAllTransactions,
    printRunningTotals
} = require('./app')

const main = async function() {
    const allTransactions = await getAllTransactions()
    printRunningTotals(allTransactions)
}

main()
