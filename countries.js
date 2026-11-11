// Country list (ISO code: name). Shared by the form and Precious Wrapped.
(() => {
  const RAW = "NG:Nigeria|GB:United Kingdom|US:United States|CA:Canada|GH:Ghana|ZA:South Africa|KE:Kenya|AE:United Arab Emirates|IE:Ireland|DE:Germany|" +
    "AF:Afghanistan|AL:Albania|DZ:Algeria|AD:Andorra|AO:Angola|AG:Antigua and Barbuda|AR:Argentina|AM:Armenia|AU:Australia|AT:Austria|AZ:Azerbaijan|" +
    "BS:Bahamas|BH:Bahrain|BD:Bangladesh|BB:Barbados|BY:Belarus|BE:Belgium|BZ:Belize|BJ:Benin|BT:Bhutan|BO:Bolivia|BA:Bosnia and Herzegovina|BW:Botswana|" +
    "BR:Brazil|BN:Brunei|BG:Bulgaria|BF:Burkina Faso|BI:Burundi|CV:Cabo Verde|KH:Cambodia|CM:Cameroon|CF:Central African Republic|TD:Chad|CL:Chile|CN:China|" +
    "CO:Colombia|KM:Comoros|CG:Congo|CD:Congo (DRC)|CR:Costa Rica|CI:Côte d'Ivoire|HR:Croatia|CU:Cuba|CY:Cyprus|CZ:Czechia|DK:Denmark|DJ:Djibouti|DM:Dominica|" +
    "DO:Dominican Republic|EC:Ecuador|EG:Egypt|SV:El Salvador|GQ:Equatorial Guinea|ER:Eritrea|EE:Estonia|SZ:Eswatini|ET:Ethiopia|FJ:Fiji|FI:Finland|FR:France|" +
    "GA:Gabon|GM:Gambia|GE:Georgia|GR:Greece|GD:Grenada|GT:Guatemala|GN:Guinea|GW:Guinea-Bissau|GY:Guyana|HT:Haiti|HN:Honduras|HK:Hong Kong|HU:Hungary|" +
    "IS:Iceland|IN:India|ID:Indonesia|IR:Iran|IQ:Iraq|IL:Israel|IT:Italy|JM:Jamaica|JP:Japan|JO:Jordan|KZ:Kazakhstan|KI:Kiribati|KW:Kuwait|KG:Kyrgyzstan|LA:Laos|" +
    "LV:Latvia|LB:Lebanon|LS:Lesotho|LR:Liberia|LY:Libya|LI:Liechtenstein|LT:Lithuania|LU:Luxembourg|MG:Madagascar|MW:Malawi|MY:Malaysia|MV:Maldives|ML:Mali|" +
    "MT:Malta|MH:Marshall Islands|MR:Mauritania|MU:Mauritius|MX:Mexico|FM:Micronesia|MD:Moldova|MC:Monaco|MN:Mongolia|ME:Montenegro|MA:Morocco|MZ:Mozambique|" +
    "MM:Myanmar|NA:Namibia|NR:Nauru|NP:Nepal|NL:Netherlands|NZ:New Zealand|NI:Nicaragua|NE:Niger|KP:North Korea|MK:North Macedonia|NO:Norway|OM:Oman|PK:Pakistan|" +
    "PW:Palau|PS:Palestine|PA:Panama|PG:Papua New Guinea|PY:Paraguay|PE:Peru|PH:Philippines|PL:Poland|PT:Portugal|QA:Qatar|RO:Romania|RU:Russia|RW:Rwanda|" +
    "KN:Saint Kitts and Nevis|LC:Saint Lucia|VC:Saint Vincent and the Grenadines|WS:Samoa|SM:San Marino|ST:São Tomé and Príncipe|SA:Saudi Arabia|SN:Senegal|" +
    "RS:Serbia|SC:Seychelles|SL:Sierra Leone|SG:Singapore|SK:Slovakia|SI:Slovenia|SB:Solomon Islands|SO:Somalia|KR:South Korea|SS:South Sudan|ES:Spain|" +
    "LK:Sri Lanka|SD:Sudan|SR:Suriname|SE:Sweden|CH:Switzerland|SY:Syria|TW:Taiwan|TJ:Tajikistan|TZ:Tanzania|TH:Thailand|TL:Timor-Leste|TG:Togo|TO:Tonga|" +
    "TT:Trinidad and Tobago|TN:Tunisia|TR:Türkiye|TM:Turkmenistan|TV:Tuvalu|UG:Uganda|UA:Ukraine|UY:Uruguay|UZ:Uzbekistan|VU:Vanuatu|VA:Vatican City|" +
    "VE:Venezuela|VN:Vietnam|YE:Yemen|ZM:Zambia|ZW:Zimbabwe";
  const all = RAW.split("|").map((p) => { const [code, name] = p.split(":"); return { code, name }; });
  const POPULAR = 10; // the first 10 entries are shown at the top of the dropdown
  // Windows doesn't draw flag emoji (it shows letters like "NG"), so skip flags there.
  const NO_FLAGS = /Windows/.test(navigator.userAgent);
  const flag = (code) => (NO_FLAGS ? "" : code ? String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0))) : "🌍");
  const byName = Object.fromEntries(all.map((c) => [c.name.toLowerCase(), c]));
  window.COUNTRIES = {
    popular: all.slice(0, POPULAR),
    all: all.slice(POPULAR).sort((a, b) => a.name.localeCompare(b.name)),
    flag,
    flagFor: (name) => flag(byName[String(name || "").toLowerCase()]?.code),
  };
})();
