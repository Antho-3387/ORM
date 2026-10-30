export function addCardToDecklist(decklist: string, cardName: string) {
  const lines = decklist.split('\n')
  const normalizedName = cardName.trim().toLocaleLowerCase()

  const existingIndex = lines.findIndex((line) => {
    const match = line.match(/^(?:SB:\s*)?(\d+)\s*x?\s+(.+)$/i)
    if (!match) return false

    const existingName = match[2]
      .trim()
      .replace(/\s+\([A-Z0-9]{2,6}\)(?:\s+[\w-]+)?$/i, '')
      .trim()

    return existingName.toLocaleLowerCase() === normalizedName
  })

  if (existingIndex >= 0) {
    const match = lines[existingIndex].match(/^((?:SB:\s*)?)(\d+)(\s*x?\s+)(.+)$/i)
    if (match) {
      lines[existingIndex] = `${match[1]}${Number(match[2]) + 1}${match[3]}${match[4]}`
      return lines.join('\n')
    }
  }

  const trimmedDecklist = decklist.trimEnd()
  const updatedLines = trimmedDecklist.split('\n')
  let commanderSeparator = -1
  for (let index = updatedLines.length - 1; index >= 0; index--) {
    if (!updatedLines[index].trim()) {
      commanderSeparator = index
    } else if (commanderSeparator >= 0) {
      break
    }
  }

  if (commanderSeparator >= 0) {
    updatedLines.splice(commanderSeparator, 0, `1 ${cardName.trim()}`)
    return updatedLines.join('\n')
  }

  return `${trimmedDecklist}${trimmedDecklist ? '\n' : ''}1 ${cardName.trim()}`
}
