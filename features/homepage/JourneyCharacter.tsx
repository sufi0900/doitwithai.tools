// One persistent character rig. Stage classes choreograph joints and held objects.
// The parent journey owns pause and reduced-motion behavior.
export default function JourneyCharacter({ stage }: { stage: number }) {
  return (
    <div className={`journey-character character-stage-${stage}`}>
      <svg
        width="360"
        height="300"
        viewBox="0 0 360 300"
        fill="none"
        aria-hidden
      >
        <ellipse
          cx="179"
          cy="281"
          rx="140"
          ry="12"
          fill="#5271ff"
          opacity=".13"
        />
        <g className="jc-chair">
          <rect x="97" y="130" width="44" height="103" rx="14" fill="#b2c2ff" />
          <path
            d="M102 224H190M110 228L101 278M179 228L192 278"
            stroke="#899cd5"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </g>
        <g className="jc-backpack">
          <path
            d="M104 129Q70 125 76 191Q91 210 119 195Z"
            fill="#f3b854"
            stroke="#d99a37"
            strokeWidth="3"
          />
          <path d="M97 148H108V179H84V165" stroke="#fff0c3" strokeWidth="3" />
          <path
            d="M103 128Q111 109 123 116"
            stroke="#d99a37"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <g className="jc-body">
          <path
            d="M124 210L145 229L158 264M153 208L187 218L205 261"
            stroke="#2a3b62"
            strokeWidth="22"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M149 259H164L177 276H145Z M196 257H211L228 275H195Z"
            fill="#192641"
          />
          <path
            d="M123 111Q146 100 178 111L190 207Q156 225 113 208Z"
            fill="#5271ff"
          />
          <path d="M135 103V119Q148 129 163 117V102" fill="#e5a275" />
          <path
            className="jc-backpack-strap"
            d="M124 117Q107 150 123 188"
            stroke="#df9e39"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <g className="jc-head">
            <ellipse cx="148" cy="73" rx="31" ry="36" fill="#f3c49e" />
            <ellipse cx="118" cy="78" rx="5" ry="8" fill="#ecb389" />
            <path
              d="M118 70Q106 30 147 29Q184 28 180 69L165 57Q142 62 127 49L121 74Z"
              fill="#253047"
            />
            <g className="jc-eyes">
              <ellipse cx="139" cy="77" rx="2.8" ry="3.2" fill="#253047" />
              <ellipse cx="160" cy="77" rx="2.8" ry="3.2" fill="#253047" />
            </g>
            <path
              d="M142 93Q151 99 160 91"
              stroke="#b7744e"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
          <g className="jc-left-arm">
            <path
              d="M124 126L100 153"
              stroke="#f3c49e"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <g className="jc-left-forearm">
              <path
                d="M100 153L135 173"
                stroke="#f3c49e"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <ellipse cx="136" cy="174" rx="9" ry="7" fill="#f3c49e" />
            </g>
          </g>
          <g className="jc-reading-arm">
            <path
              d="M178 126L202 153"
              stroke="#f3c49e"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <g className="jc-reading-forearm">
              <path
                d="M202 153L194 180"
                stroke="#f3c49e"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <ellipse cx="193" cy="178" rx="9" ry="7" fill="#f3c49e" />
            </g>
          </g>
        </g>
        <g className="jc-book">
          <g className="jc-book-left">
            <path
              d="M105 157Q130 151 154 161V205Q132 192 105 198Z"
              fill="#fff"
              stroke="#344b9d"
              strokeWidth="3"
            />
            <path
              d="M115 168L143 172M115 179L143 183M115 189L139 192"
              stroke="#a7b8ed"
              strokeWidth="2"
            />
          </g>
          <g className="jc-book-right">
            <path
              d="M154 161Q178 150 203 157V198Q180 192 154 205Z"
              fill="#fff"
              stroke="#344b9d"
              strokeWidth="3"
            />
            <path
              d="M166 172L192 168M166 183L192 179M166 193L189 189"
              stroke="#a7b8ed"
              strokeWidth="2"
            />
          </g>
          <g className="jc-turning-page">
            <path
              d="M154 161Q178 151 201 158V196Q178 192 154 205Z"
              fill="#f4f7ff"
              stroke="#a7b8ed"
              strokeWidth="1.5"
            />
            <path
              d="M165 172L191 168M165 183L191 179"
              stroke="#c0cdf2"
              strokeWidth="2"
            />
          </g>
          <g className="jc-closed-book">
            <rect
              x="103"
              y="156"
              width="54"
              height="48"
              rx="4"
              fill="#354da0"
            />
            <path d="M110 162H151V197H110" fill="#f8faff" />
            <path
              d="M113 167H147M113 172H147M113 177H147"
              stroke="#cad4f1"
              strokeWidth="2"
            />
            <rect x="103" y="156" width="7" height="48" rx="2" fill="#5271ff" />
          </g>
        </g>
        <g className="jc-resource-shelf">
          <rect
            x="247"
            y="110"
            width="72"
            height="50"
            rx="10"
            fill="#eff3ff"
            stroke="#aabaff"
          />
          <path
            d="M242 160H324"
            stroke="#92a5e6"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <rect
            x="263"
            y="100"
            width="35"
            height="49"
            rx="4"
            fill="#fff"
            stroke="#b2c3f6"
          />
          <path
            d="M273 112H290M273 119H290M273 126H286"
            stroke="#5271ff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        <g className="jc-collection-arm">
          <path
            d="M178 126L219 136"
            stroke="#f3c49e"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <g className="jc-pick-forearm">
            <path
              d="M219 136L260 121"
              stroke="#f3c49e"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <g className="jc-grip">
              <ellipse cx="262" cy="121" rx="10" ry="7" fill="#f3c49e" />
              <path
                d="M257 119L267 116"
                stroke="#d6966b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
        <g className="jc-held-resource">
          <rect
            x="255"
            y="119"
            width="37"
            height="42"
            rx="4"
            fill="#fff"
            stroke="#5271ff"
            strokeWidth="2"
          />
          <g className="jc-resource-icon jc-icon-0">
            <path
              d="M264 131L260 135L264 139M282 131L286 135L282 139M275 130L271 140"
              stroke="#5271ff"
              strokeWidth="2"
            />
            <text
              x="273"
              y="151"
              fontSize="5.5"
              fill="#354da0"
              textAnchor="middle"
            >
              PROMPT
            </text>
          </g>
          <g className="jc-resource-icon jc-icon-1">
            <rect
              x="263"
              y="128"
              width="20"
              height="14"
              rx="2"
              fill="#dce7ff"
            />
            <circle cx="278" cy="132" r="2" fill="#f8c56c" />
            <path
              d="M263 141L269 133L275 139L279 136L283 142Z"
              fill="#5271ff"
            />
            <text
              x="273"
              y="151"
              fontSize="5.5"
              fill="#354da0"
              textAnchor="middle"
            >
              VISUAL
            </text>
          </g>
          <g className="jc-resource-icon jc-icon-2">
            <path d="M267 128H279V143H267Z" fill="#fce5dd" stroke="#e28b71" />
            <path d="M270 132H276M270 136H276M270 140H274" stroke="#e28b71" />
            <text
              x="273"
              y="151"
              fontSize="5.5"
              fill="#354da0"
              textAnchor="middle"
            >
              PDF
            </text>
          </g>
          <g className="jc-resource-icon jc-icon-3">
            <rect
              x="263"
              y="128"
              width="21"
              height="15"
              rx="3"
              fill="#5271ff"
            />
            <path d="M271 131L278 135L271 140Z" fill="#fff" />
            <text
              x="273"
              y="151"
              fontSize="5.5"
              fill="#354da0"
              textAnchor="middle"
            >
              VIDEO
            </text>
          </g>
        </g>
        <g className="jc-bag">
          <path
            d="M240 184V175Q261 152 285 175V184"
            stroke="#c7892f"
            strokeWidth="6"
          />
          <rect
            x="225"
            y="182"
            width="76"
            height="86"
            rx="15"
            fill="#f8ca6d"
            stroke="#d99d3c"
            strokeWidth="2"
          />
          <ellipse cx="263" cy="184" rx="32" ry="7" fill="#a96c24" />
          <rect x="234" y="220" width="58" height="33" rx="6" fill="#fff3d0" />
          <text
            x="263"
            y="233"
            fontSize="9"
            fontWeight="700"
            fill="#745021"
            textAnchor="middle"
          >
            FREE
          </text>
          <text
            x="263"
            y="245"
            fontSize="8"
            fontWeight="700"
            fill="#745021"
            textAnchor="middle"
          >
            RESOURCES
          </text>
          <g className="jc-bag-flap">
            <path
              d="M229 181Q263 169 298 181V207Q264 220 229 207Z"
              fill="#f8d789"
              stroke="#d99d3c"
              strokeWidth="2"
            />
            <rect
              x="258"
              y="199"
              width="11"
              height="12"
              rx="2"
              fill="#c7892f"
            />
          </g>
        </g>
        <g className="jc-desk">
          <path
            d="M151 221H326L343 236H140Z"
            fill="#e2b884"
            stroke="#c59461"
            strokeWidth="2"
          />
          <path d="M156 235V278M325 235V278" stroke="#c59461" strokeWidth="8" />
          <path d="M212 203H275L287 220H224Z" fill="#fff" stroke="#ccd6f0" />
          <path
            className="jc-written-line jc-written-1"
            d="M230 208H260"
            stroke="#5271ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="jc-written-line jc-written-2"
            d="M234 212H270"
            stroke="#5271ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="jc-written-line jc-written-3"
            d="M238 216H264"
            stroke="#5271ff"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <g className="jc-desk-book">
            <path d="M159 203L191 200L207 218L173 221Z" fill="#5271ff" />
            <path d="M165 207L190 205L199 215L174 217Z" fill="#f5f7ff" />
            <path
              d="M169 211L190 209M172 214L193 212"
              stroke="#b2c3f6"
              strokeWidth="1.5"
            />
          </g>
        </g>
        <g className="jc-writing-arm">
          <path
            d="M177 128L189 177"
            stroke="#f3c49e"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <g className="jc-writing-forearm">
            <path
              d="M189 177L239 200"
              stroke="#f3c49e"
              strokeWidth="12"
              strokeLinecap="round"
            />
            <g className="jc-pen-hand">
              <path
                d="M240 198L249 215"
                stroke="#25375f"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path d="M249 215L251 219" stroke="#e4ae72" strokeWidth="2" />
              <ellipse cx="238" cy="199" rx="10" ry="7" fill="#f3c49e" />
              <path
                d="M239 201L245 202"
                stroke="#d6966b"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
          </g>
        </g>
      </svg>
      <span className="jc-caption">
        {
          [
            "Read the guide. Turn the page.",
            "Close the book. Pack your resources.",
            "Bring your learning to the desk.",
          ][stage]
        }
      </span>
    </div>
  );
}
