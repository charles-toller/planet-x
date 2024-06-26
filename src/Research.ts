import {ObjectType} from "./Game";

export const singularWord: {[key in ObjectType]: string} = {
    [ObjectType.EMPTY]: "empty sector",
    [ObjectType.ASTEROID]: "asteroid",
    [ObjectType.DWARF_PLANET]: "dwarf planet",
    [ObjectType.COMET]: "comet",
    [ObjectType.GAS_CLOUD]: "gas cloud",
    [ObjectType.PLANET_X]: "Planet X",
    [ObjectType.BOT]: "Bot",
    [ObjectType.PLAYER]: "Player",
};
const pluralWord: {[key in ObjectType]: string} = {
    [ObjectType.EMPTY]: "empty sectors",
    [ObjectType.ASTEROID]: "asteroids",
    [ObjectType.DWARF_PLANET]: "dwarf planets",
    [ObjectType.COMET]: "comets",
    [ObjectType.GAS_CLOUD]: "gas clouds",
    [ObjectType.PLANET_X]: "Planet X",
    [ObjectType.BOT]: "Bot",
    [ObjectType.PLAYER]: "Player",
};
export const titlePluralWords: {[key in ObjectType]: string} = {
    [ObjectType.EMPTY]: "Empty Sectors",
    [ObjectType.ASTEROID]: "Asteroids",
    [ObjectType.DWARF_PLANET]: "Dwarf Planets",
    [ObjectType.COMET]: "Comets",
    [ObjectType.GAS_CLOUD]: "Gas Clouds",
    [ObjectType.PLANET_X]: "Planet X",
    [ObjectType.BOT]: "Bot",
    [ObjectType.PLAYER]: "Player",
};
const article: {[key in ObjectType]: string} = {
    [ObjectType.EMPTY]: "an",
    [ObjectType.ASTEROID]: "an",
    [ObjectType.DWARF_PLANET]: "a",
    [ObjectType.COMET]: "a",
    [ObjectType.GAS_CLOUD]: "a",
    [ObjectType.PLANET_X]: "a",
    [ObjectType.BOT]: "a",
    [ObjectType.PLAYER]: "a",
}
export function getNObjectsName(obj: ObjectType, n: number) {
    if (n === 1) return singularWord[obj];
    return pluralWord[obj];
}
function s(n: number): string {
    if (n === 1) return '';
    return 's';
}
export function is(n: number): string {
    if (n === 1) return 'is';
    return 'are';
}
export function researchName(types: ObjectType[], letters = false) {
    return types.map((type) => {
        if (letters) {
            if (type === ObjectType.PLANET_X) return 'X';
            return titlePluralWords[type].slice(0, 1)
        }
        return titlePluralWords[type]
    }).join(letters ? ' + ' : " & ");
}
function yArticle(data: {X: ObjectType; Y: ObjectType; N: number}): string {
    if (data.X === data.Y) {
        return "another";
    }
    return article[data.Y];
}
export const researchLookup: {[key: string]: ((data: {X: ObjectType; Y: ObjectType; N: number}) => string)} = {
    confClue1PlusXAdjacentY: (data) => `At least one ${singularWord[data.X]} is adjacent to ${yArticle(data)} ${singularWord[data.Y]}`,
    confClue9WithinNY: (data) => `Planet X is within ${data.N} sector${s(data.N)} of ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueNXConsecutive: (data) => `There ${is(data.N)} ${data.N} ${getNObjectsName(data.X, data.N)} in consecutive sectors`,
    confClueNoXWithinNY: (data) => `No ${singularWord[data.X]} is within ${data.N} sector${s(data.N)} of ${yArticle(data)} ${singularWord[data.Y]}`,
    confClue1PlusXOppositeY: (data) => `At least one ${singularWord[data.X]} is directly opposite ${yArticle(data)} ${singularWord[data.Y]}`,
    confClue9NotOppositeY: (data) => `Planet X is not directly opposite ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueAllXWithinNY: (data) => `Every ${singularWord[data.X]} is within ${data.N} sector${s(data.N)} of ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueNoXOppositeY: (data) => `No ${singularWord[data.X]} is directly opposite ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueAllXWithinN: (data) => `All the ${pluralWord[data.X]} are in a band of ${data.N} sector${s(data.N)} or less`,
    confClueNoXWithin1Y: (data) => `No ${singularWord[data.X]} is adjacent to ${yArticle(data)} ${singularWord[data.Y]}`,
    confClue9NotWithin1Y: (data) => `Planet X is not adjacent to ${yArticle(data)} ${singularWord[data.Y]}`,
    confClue9NotWithinNY: (data) => `Planet X is not within ${data.N} sector${s(data.N)} of ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueAllXOppositeY: (data) => `Every ${singularWord[data.X]} is directly opposite ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueAllXWithin1Y: (data) => `Every ${singularWord[data.X]} is adjacent to ${yArticle(data)} ${singularWord[data.Y]}`,
    confClueAllXConsecutive: (data) => `All the ${pluralWord[data.X]} are in consecutive sectors`
};