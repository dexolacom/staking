// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
export const reduceValue = val => +val / 10 ** 18

export const convertValue = (value: any) => '0x' + (+value * 10 ** 18).toString(16)

export function checkSmallValueAndZero(value, digitsAmount = 2) {
  return +value === 0 ? '0' : reduceValue(value) < 0.0001 ? '< 0.0001 ' : reduceValue(value).toFixedDown(digitsAmount)
}

export function checkSmallValue(value, digitsAmount = 2) {
  return reduceValue(value) < 0.0001 ? '< 0.0001 ' : reduceValue(value).toFixedDown(digitsAmount)
}

export const gnbuNbuConvert = async (amount, routerContract, adressGNBU, adressNBU, setFunction) => {
  const amountStr = (amount * 10 ** 18).toString()
  const convertedAmount = await routerContract.methods.getAmountsOut(amountStr, [adressGNBU, adressNBU]).call()
  setFunction(reduceValue(convertedAmount[1]))
}

export const convertValueNew = oldValue => {
  if (typeof oldValue !== 'string') {
    //console.log(" ERROR! Wrong parametr's type: ", typeof oldValue)
    return
  }
  const splitedOldValue = oldValue.split('.')
  const newValue =
    splitedOldValue.length > 1
      ? (+splitedOldValue[0] === 0 ? '' : splitedOldValue[0]) + splitedOldValue[1].slice(0, 18).padEnd(18, '0')
      : splitedOldValue[0] + '000000000000000000'
  return newValue
}
