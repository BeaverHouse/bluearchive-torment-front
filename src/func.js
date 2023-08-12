export const filteredPartys = (
    data,
    includeArray,
    excludeArray,
    assist,
    partyCountRange,
    under4Array,
    under3Array,
) => {
    const rawPartys = data.partys
    return rawPartys.filter((party) => (
        arrayIncludes(party.characters, includeArray) &&
        !arrayDuplicates(party.characters, excludeArray) &&
        (!assist || party.assist === assist) &&
        party.party_count >= partyCountRange[0] &&
        party.party_count <= partyCountRange[1] &&
        arrayIncludes(party.under3 || [], under3Array) &&
        arrayIncludes(party.under4 || [], under4Array)
    ))
}


// https://stackoverflow.com/questions/53606337/check-if-array-contains-all-elements-of-another-array
const arrayIncludes = (arr1, arr2) => {
    const checker = (arr, target) => target.every(v => arr.includes(v));
    return checker(arr1, arr2)
}

const arrayDuplicates = (arr1, arr2) => {
    return arr1.some(r => arr2.indexOf(r) >= 0)
}