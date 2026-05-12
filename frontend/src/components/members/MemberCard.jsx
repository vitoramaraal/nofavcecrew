function MemberCard({ member }) {
  const memberId = member?.member_number || 'NFC-000000'
  const name = member?.full_name || 'NOFVCE MEMBER'
  const car = member?.car_model || 'CARRO NÃO INFORMADO'
  const memberPhoto = member?.member_photo_url
  const carPhoto = member?.image_url

  const joined = member?.created_at
    ? new Date(member.created_at).toLocaleDateString('pt-BR')
    : '--/--/----'

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[430px] rounded-[2rem] border border-white/10 bg-zinc-950 p-3 shadow-2xl">
        <svg
          viewBox="0 0 1600 1000"
          className="block h-auto w-full rounded-[1.5rem]"
          role="img"
        >
          <defs>
            <clipPath id="memberPhotoClip">
              <rect x="90" y="305" width="330" height="410" rx="35" />
            </clipPath>

            <clipPath id="carPhotoClip">
              <rect x="1045" y="350" width="420" height="260" rx="32" />
            </clipPath>

            <pattern
              id="scratches"
              width="28"
              height="28"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(35)"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="28"
                stroke="white"
                strokeOpacity="0.08"
                strokeWidth="1"
              />
            </pattern>

            <radialGradient id="glow" cx="75%" cy="20%" r="70%">
              <stop offset="0%" stopColor="#333333" stopOpacity="0.7" />
              <stop offset="45%" stopColor="#111111" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#050505" stopOpacity="1" />
            </radialGradient>
          </defs>

          <rect width="1600" height="1000" rx="70" fill="#050505" />
          <rect
            x="2"
            y="2"
            width="1596"
            height="996"
            rx="70"
            fill="url(#glow)"
          />
          <rect
            width="1600"
            height="1000"
            rx="70"
            fill="url(#scratches)"
          />

          <circle cx="1300" cy="90" r="310" fill="white" opacity="0.035" />
          <circle cx="220" cy="900" r="260" fill="white" opacity="0.025" />

          <image
            href="/nofvce/logo-letra-white.png"
            x="0"
            y="-180"
            width="1000"
            height="635"
            preserveAspectRatio="xMinYMid meet"
          />

          <text
            x="1450"
            y="115"
            textAnchor="end"
            fill="#8b8b8b"
            fontSize="34"
            fontWeight="900"
            letterSpacing="18"
          >
            MEMBER ID
          </text>

          <text
            x="1450"
            y="185"
            textAnchor="end"
            fill="#ffffff"
            fontSize="62"
            fontWeight="900"
            letterSpacing="10"
          >
            {memberId}
          </text>

          <rect
            x="85"
            y="245"
            width="1430"
            height="2"
            fill="white"
            opacity="0.1"
          />

          <rect
            x="90"
            y="305"
            width="330"
            height="410"
            rx="35"
            fill="#111111"
            stroke="white"
            strokeOpacity="0.14"
          />

          {memberPhoto ? (
            <image
              href={memberPhoto}
              x="90"
              y="305"
              width="330"
              height="410"
              preserveAspectRatio="xMidYMid slice"
              clipPath="url(#memberPhotoClip)"
              opacity="0.9"
            />
          ) : (
            <text
              x="255"
              y="520"
              textAnchor="middle"
              fill="#555"
              fontSize="32"
              fontWeight="900"
            >
              MEMBRO
            </text>
          )}

          <text
            x="90"
            y="775"
            fill="#777777"
            fontSize="34"
            fontWeight="900"
            letterSpacing="18"
          >
            MEMBRO
          </text>

          <text
            x="500"
            y="335"
            fill="#777777"
            fontSize="28"
            fontWeight="900"
            letterSpacing="18"
          >
            NOME
          </text>

          <text
            x="500"
            y="420"
            fill="#ffffff"
            fontSize="76"
            fontWeight="900"
          >
            {limit(name, 18)}
          </text>

          <text
            x="500"
            y="540"
            fill="#777777"
            fontSize="28"
            fontWeight="900"
            letterSpacing="18"
          >
            ENTRADA
          </text>

          <text
            x="500"
            y="615"
            fill="#ffffff"
            fontSize="56"
            fontWeight="900"
          >
            {joined}
          </text>

          <text
            x="500"
            y="735"
            fill="#777777"
            fontSize="28"
            fontWeight="900"
            letterSpacing="18"
          >
            CARRO
          </text>

          <text
            x="500"
            y="810"
            fill="#ffffff"
            fontSize="56"
            fontWeight="900"
          >
            {limit(car, 18)}
          </text>

          <text
            x="1045"
            y="320"
            fill="#777777"
            fontSize="28"
            fontWeight="900"
            letterSpacing="18"
          >
            VEÍCULO
          </text>

          <rect
            x="1045"
            y="350"
            width="420"
            height="260"
            rx="32"
            fill="#111111"
            stroke="white"
            strokeOpacity="0.14"
          />

          {carPhoto ? (
            <image
              href={carPhoto}
              x="1045"
              y="350"
              width="420"
              height="260"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#carPhotoClip)"
              opacity="0.9"
            />
          ) : (
            <text
              x="1255"
              y="495"
              textAnchor="middle"
              fill="#555"
              fontSize="32"
              fontWeight="900"
            >
              CARRO
            </text>
          )}

          <rect
            x="1130"
            y="665"
            width="250"
            height="250"
            rx="30"
            fill="white"
          />

          <FakeQrSvg
            x={1155}
            y={690}
            size={200}
            value={memberId}
          />

          <text
            x="1255"
            y="960"
            textAnchor="middle"
            fill="#777777"
            fontSize="28"
            fontWeight="900"
            letterSpacing="12"
          >
            @NOFVCECREW
          </text>

          <rect
            x="85"
            y="880"
            width="1430"
            height="2"
            fill="white"
            opacity="0.12"
          />

          <image
            href="/nofvce/mask-white.png"
            x="95"
            y="910"
            width="52"
            height="52"
            preserveAspectRatio="xMidYMid meet"
            opacity="0.75"
          />

          <text
            x="170"
            y="948"
            fill="#bdbdbd"
            fontSize="30"
            fontWeight="600"
          >
            Membro oficial da NoFvce Crew
          </text>

          <text
            x="1510"
            y="948"
            textAnchor="end"
            fill="#777777"
            fontSize="28"
            fontWeight="900"
            letterSpacing="14"
          >
            PRIVATE ACCESS
          </text>

          <rect
            x="3"
            y="3"
            width="1594"
            height="994"
            rx="70"
            fill="none"
            stroke="white"
            strokeOpacity="0.14"
            strokeWidth="4"
          />
        </svg>
      </div>
    </section>
  )
}

function FakeQrSvg({ x, y, size, value }) {
  const seed = value
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0)

  const cells = Array.from({ length: 100 }, (_, index) => {
    const row = Math.floor(index / 10)
    const col = index % 10

    const corner =
      (row < 3 && col < 3) ||
      (row < 3 && col > 6) ||
      (row > 6 && col < 3)

    return corner || (index * seed + row + col) % 3 !== 0
  })

  const cellSize = size / 10

  return (
    <g>
      {cells.map((active, index) => {
        const row = Math.floor(index / 10)
        const col = index % 10

        return (
          <rect
            key={index}
            x={x + col * cellSize}
            y={y + row * cellSize}
            width={cellSize - 2}
            height={cellSize - 2}
            fill={active ? '#000000' : '#ffffff'}
          />
        )
      })}
    </g>
  )
}

function limit(text, max) {
  if (!text) return ''
  return text.length > max
    ? `${text.slice(0, max - 1)}…`
    : text
}

export default MemberCard