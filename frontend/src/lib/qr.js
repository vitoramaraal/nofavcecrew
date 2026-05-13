const version = 5
const size = version * 4 + 17
const dataCodewords = 108
const eccCodewords = 26

export function createQrMatrix(value) {
  const data = encodeData(value)
  const ecc = createErrorCorrection(data, eccCodewords)
  const bits = [...data, ...ecc].flatMap((byte) =>
    Array.from({ length: 8 }, (_, index) => ((byte >>> (7 - index)) & 1) === 1),
  )

  const modules = createMatrix(null)
  const reserved = createMatrix(false)

  drawFunctionPatterns(modules, reserved)
  drawCodewords(modules, reserved, bits)
  applyMask(modules, reserved)
  drawFormatBits(modules, reserved)

  return modules
}

function encodeData(value) {
  const bytes = Array.from(new TextEncoder().encode(value))
  const bitBuffer = []

  if (bytes.length > dataCodewords - 2) {
    throw new Error('QR payload is too long.')
  }

  appendBits(bitBuffer, 0b0100, 4)
  appendBits(bitBuffer, bytes.length, 8)
  bytes.forEach((byte) => appendBits(bitBuffer, byte, 8))

  const capacityBits = dataCodewords * 8
  const terminatorLength = Math.min(4, capacityBits - bitBuffer.length)
  appendBits(bitBuffer, 0, terminatorLength)

  while (bitBuffer.length % 8 !== 0) {
    bitBuffer.push(false)
  }

  const result = []

  for (let index = 0; index < bitBuffer.length; index += 8) {
    let byte = 0

    for (let offset = 0; offset < 8; offset += 1) {
      byte = (byte << 1) | (bitBuffer[index + offset] ? 1 : 0)
    }

    result.push(byte)
  }

  for (let pad = 0; result.length < dataCodewords; pad += 1) {
    result.push(pad % 2 === 0 ? 0xec : 0x11)
  }

  return result
}

function appendBits(buffer, value, length) {
  for (let index = length - 1; index >= 0; index -= 1) {
    buffer.push(((value >>> index) & 1) === 1)
  }
}

function createErrorCorrection(data, degree) {
  const divisor = createGenerator(degree)
  const result = Array(degree).fill(0)

  data.forEach((byte) => {
    const factor = byte ^ result.shift()
    result.push(0)

    divisor.forEach((coefficient, index) => {
      result[index] ^= multiply(coefficient, factor)
    })
  })

  return result
}

function createGenerator(degree) {
  let result = [1]

  for (let index = 0; index < degree; index += 1) {
    result = multiplyPolynomial(result, [1, power(2, index)])
  }

  return result.slice(1)
}

function multiplyPolynomial(left, right) {
  const result = Array(left.length + right.length - 1).fill(0)

  left.forEach((leftValue, leftIndex) => {
    right.forEach((rightValue, rightIndex) => {
      result[leftIndex + rightIndex] ^= multiply(leftValue, rightValue)
    })
  })

  return result
}

function power(value, exponent) {
  let result = 1

  for (let index = 0; index < exponent; index += 1) {
    result = multiply(result, value)
  }

  return result
}

function multiply(left, right) {
  let result = 0

  for (let index = 0; index < 8; index += 1) {
    if ((right & 1) !== 0) {
      result ^= left
    }

    const carry = (left & 0x80) !== 0
    left = (left << 1) & 0xff

    if (carry) {
      left ^= 0x1d
    }

    right >>>= 1
  }

  return result
}

function createMatrix(value) {
  return Array.from({ length: size }, () => Array(size).fill(value))
}

function drawFunctionPatterns(modules, reserved) {
  drawFinder(modules, reserved, 0, 0)
  drawFinder(modules, reserved, size - 7, 0)
  drawFinder(modules, reserved, 0, size - 7)

  for (let index = 8; index < size - 8; index += 1) {
    setFunctionModule(modules, reserved, 6, index, index % 2 === 0)
    setFunctionModule(modules, reserved, index, 6, index % 2 === 0)
  }

  drawAlignment(modules, reserved, 30, 30)
  setFunctionModule(modules, reserved, 4 * version + 9, 8, true)

  for (let index = 0; index < 8; index += 1) {
    reserve(modules, reserved, 8, index)
    reserve(modules, reserved, index, 8)
    reserve(modules, reserved, 8, size - 1 - index)
    reserve(modules, reserved, size - 1 - index, 8)
  }
}

function drawFinder(modules, reserved, left, top) {
  for (let row = -1; row <= 7; row += 1) {
    for (let col = -1; col <= 7; col += 1) {
      const currentRow = top + row
      const currentCol = left + col

      if (
        currentRow < 0 ||
        currentRow >= size ||
        currentCol < 0 ||
        currentCol >= size
      ) {
        continue
      }

      const isBorder = row === 0 || row === 6 || col === 0 || col === 6
      const isCenter = row >= 2 && row <= 4 && col >= 2 && col <= 4

      setFunctionModule(
        modules,
        reserved,
        currentRow,
        currentCol,
        isBorder || isCenter,
      )
    }
  }
}

function drawAlignment(modules, reserved, centerRow, centerCol) {
  for (let row = -2; row <= 2; row += 1) {
    for (let col = -2; col <= 2; col += 1) {
      const distance = Math.max(Math.abs(row), Math.abs(col))

      setFunctionModule(
        modules,
        reserved,
        centerRow + row,
        centerCol + col,
        distance !== 1,
      )
    }
  }
}

function reserve(modules, reserved, row, col) {
  if (modules[row][col] === null) {
    modules[row][col] = false
  }

  reserved[row][col] = true
}

function setFunctionModule(modules, reserved, row, col, value) {
  modules[row][col] = value
  reserved[row][col] = true
}

function drawCodewords(modules, reserved, bits) {
  let bitIndex = 0
  let upward = true

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1
    }

    for (let vertical = 0; vertical < size; vertical += 1) {
      const row = upward ? size - 1 - vertical : vertical

      for (let columnOffset = 0; columnOffset < 2; columnOffset += 1) {
        const col = right - columnOffset

        if (reserved[row][col]) continue

        modules[row][col] = bitIndex < bits.length ? bits[bitIndex] : false
        bitIndex += 1
      }
    }

    upward = !upward
  }
}

function applyMask(modules, reserved) {
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!reserved[row][col] && (row + col) % 2 === 0) {
        modules[row][col] = !modules[row][col]
      }
    }
  }
}

function drawFormatBits(modules, reserved) {
  const bits = getFormatBits(0b01, 0)

  for (let index = 0; index <= 5; index += 1) {
    setFunctionModule(modules, reserved, 8, index, getBit(bits, index))
  }

  setFunctionModule(modules, reserved, 8, 7, getBit(bits, 6))
  setFunctionModule(modules, reserved, 8, 8, getBit(bits, 7))
  setFunctionModule(modules, reserved, 7, 8, getBit(bits, 8))

  for (let index = 9; index < 15; index += 1) {
    setFunctionModule(modules, reserved, 14 - index, 8, getBit(bits, index))
  }

  for (let index = 0; index < 8; index += 1) {
    setFunctionModule(modules, reserved, size - 1 - index, 8, getBit(bits, index))
  }

  for (let index = 8; index < 15; index += 1) {
    setFunctionModule(
      modules,
      reserved,
      8,
      size - 15 + index,
      getBit(bits, index),
    )
  }
}

function getFormatBits(errorCorrectionLevel, mask) {
  const data = (errorCorrectionLevel << 3) | mask
  let remainder = data << 10

  for (let index = 14; index >= 10; index -= 1) {
    if (((remainder >>> index) & 1) !== 0) {
      remainder ^= 0x537 << (index - 10)
    }
  }

  return ((data << 10) | remainder) ^ 0x5412
}

function getBit(value, index) {
  return ((value >>> index) & 1) !== 0
}
