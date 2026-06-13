interface LocationData {
  states: Record<string, string[]>
}

const STATIC_LOCATION_DATA: Record<string, LocationData> = {
  Brasil: {
    states: {
      Acre: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira'],
      Alagoas: ['Maceió', 'Arapiraca', 'Rio Largo'],
      Amapá: ['Macapá', 'Santana', 'Laranjal do Jari'],
      Amazonas: ['Manaus', 'Parintins', 'Itacoatiara'],
      Bahia: [
        'Salvador',
        'Feira de Santana',
        'Vitória da Conquista',
        'Camaçari',
      ],
      Ceará: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte'],
      'Distrito Federal': ['Brasília'],
      'Espírito Santo': ['Vitória', 'Vila Velha', 'Serra', 'Cariacica'],
      Goiás: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis'],
      Maranhão: ['São Luís', 'Imperatriz', 'São José de Ribamar'],
      'Mato Grosso': ['Cuiabá', 'Várzea Grande', 'Rondonópolis'],
      'Mato Grosso do Sul': ['Campo Grande', 'Dourados', 'Três Lagoas'],
      'Minas Gerais': [
        'Belo Horizonte',
        'Uberlândia',
        'Contagem',
        'Juiz de Fora',
      ],
      Pará: ['Belém', 'Ananindeua', 'Santarém'],
      Paraíba: ['João Pessoa', 'Campina Grande', 'Santa Rita'],
      Paraná: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa'],
      Pernambuco: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru'],
      Piauí: ['Teresina', 'Parnaíba', 'Picos'],
      'Rio de Janeiro': [
        'Rio de Janeiro',
        'São Gonçalo',
        'Duque de Caxias',
        'Nova Iguaçu',
      ],
      'Rio Grande do Norte': ['Natal', 'Mossoró', 'Parnamirim'],
      'Rio Grande do Sul': [
        'Porto Alegre',
        'Caxias do Sul',
        'Pelotas',
        'Canoas',
      ],
      Rondônia: ['Porto Velho', 'Ji-Paraná', 'Ariquemes'],
      Roraima: ['Boa Vista', 'Rorainópolis'],
      'Santa Catarina': ['Florianópolis', 'Joinville', 'Blumenau', 'São José'],
      'São Paulo': [
        'São Paulo',
        'Guarulhos',
        'Campinas',
        'São Bernardo do Campo',
      ],
      Sergipe: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto'],
      Tocantins: ['Palmas', 'Araguaína', 'Gurupi'],
    },
  },
  USA: {
    states: {
      Alabama: ['Montgomery', 'Birmingham', 'Huntsville'],
      Alaska: ['Juneau', 'Anchorage', 'Fairbanks'],
      Arizona: ['Phoenix', 'Tucson', 'Mesa'],
      Arkansas: ['Little Rock', 'Fort Smith', 'Fayetteville'],
      California: ['Sacramento', 'Los Angeles', 'San Diego', 'San Francisco'],
      Colorado: ['Denver', 'Colorado Springs', 'Aurora'],
      Connecticut: ['Hartford', 'New Haven', 'Stamford'],
      Delaware: ['Dover', 'Wilmington', 'Newark'],
      Florida: ['Tallahassee', 'Jacksonville', 'Miami', 'Orlando'],
      Georgia: ['Atlanta', 'Augusta', 'Columbus'],
      Hawaii: ['Honolulu', 'Hilo', 'Kailua'],
      Idaho: ['Boise', 'Meridian', 'Nampa'],
      Illinois: ['Springfield', 'Chicago', 'Aurora'],
      Indiana: ['Indianapolis', 'Fort Wayne', 'Evansville'],
      Iowa: ['Des Moines', 'Cedar Rapids', 'Davenport'],
      Kansas: ['Topeka', 'Wichita', 'Overland Park'],
      Kentucky: ['Frankfort', 'Louisville', 'Lexington'],
      Louisiana: ['Baton Rouge', 'New Orleans', 'Shreveport'],
      Maine: ['Augusta', 'Portland', 'Lewiston'],
      Maryland: ['Annapolis', 'Baltimore', 'Frederick'],
      Massachusetts: ['Boston', 'Worcester', 'Springfield'],
      Michigan: ['Lansing', 'Detroit', 'Grand Rapids'],
      Minnesota: ['St. Paul', 'Minneapolis', 'Rochester'],
      Mississippi: ['Jackson', 'Gulfport', 'Southaven'],
      Missouri: ['Jefferson City', 'Kansas City', 'St. Louis'],
      Montana: ['Helena', 'Billings', 'Missoula'],
      Nebraska: ['Lincoln', 'Omaha', 'Bellevue'],
      Nevada: ['Carson City', 'Las Vegas', 'Reno'],
      'New Hampshire': ['Concord', 'Manchester', 'Nashua'],
      'New Jersey': ['Trenton', 'Newark', 'Jersey City'],
      'New Mexico': ['Santa Fe', 'Albuquerque', 'Las Cruces'],
      'New York': ['Albany', 'New York City', 'Buffalo', 'Rochester'],
      'North Carolina': ['Raleigh', 'Charlotte', 'Greensboro'],
      'North Dakota': ['Bismarck', 'Fargo', 'Grand Forks'],
      Ohio: ['Columbus', 'Cleveland', 'Cincinnati'],
      Oklahoma: ['Oklahoma City', 'Tulsa', 'Norman'],
      Oregon: ['Salem', 'Portland', 'Eugene'],
      Pennsylvania: ['Harrisburg', 'Philadelphia', 'Pittsburgh'],
      'Rhode Island': ['Providence', 'Warwick', 'Cranston'],
      'South Carolina': ['Columbia', 'Charleston', 'North Charleston'],
      'South Dakota': ['Pierre', 'Sioux Falls', 'Rapid City'],
      Tennessee: ['Nashville', 'Memphis', 'Knoxville'],
      Texas: ['Austin', 'Houston', 'Dallas', 'San Antonio'],
      Utah: ['Salt Lake City', 'West Valley City', 'Provo'],
      Vermont: ['Montpelier', 'Burlington', 'Rutland'],
      Virginia: ['Richmond', 'Virginia Beach', 'Norfolk'],
      Washington: ['Olympia', 'Seattle', 'Spokane'],
      'West Virginia': ['Charleston', 'Huntington', 'Morgantown'],
      Wisconsin: ['Madison', 'Milwaukee', 'Green Bay'],
      Wyoming: ['Cheyenne', 'Casper', 'Laramie'],
    },
  },
  Portugal: {
    states: {
      Lisboa: ['Lisboa', 'Cascais', 'Sintra', 'Amadora'],
      Porto: ['Porto', 'Vila Nova de Gaia', 'Matosinhos'],
      Algarve: ['Faro', 'Albufeira', 'Lagos', 'Portimão'],
      Madeira: ['Funchal'],
    },
  },
  France: {
    states: {
      'Île-de-France': ['Paris', 'Versailles', 'Boulogne-Billancourt'],
      "Provence-Alpes-Côte d'Azur": [
        'Marseille',
        'Nice',
        'Cannes',
        'Aix-en-Provence',
      ],
      'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne'],
    },
  },
  Germany: {
    states: {
      Bavaria: ['Munich', 'Nuremberg', 'Augsburg'],
      Berlin: ['Berlin'],
      Hamburg: ['Hamburg'],
      Hesse: ['Frankfurt', 'Wiesbaden'],
    },
  },
  Italy: {
    states: {
      Lazio: ['Rome', 'Latina'],
      Lombardy: ['Milan', 'Bergamo', 'Brescia'],
      Veneto: ['Venice', 'Verona', 'Padua'],
      Tuscany: ['Florence', 'Pisa', 'Siena'],
    },
  },
  China: {
    states: {
      Beijing: ['Beijing'],
      Shanghai: ['Shanghai'],
      Guangdong: ['Guangzhou', 'Shenzhen'],
    },
  },
  Japan: {
    states: {
      Tokyo: ['Tokyo', 'Shinjuku', 'Shibuya'],
      Osaka: ['Osaka', 'Sakai'],
      Kyoto: ['Kyoto'],
      Hokkaido: ['Sapporo'],
    },
  },
  Mexico: {
    states: {
      'Mexico City': ['Mexico City'],
      Jalisco: ['Guadalajara'],
      'Nuevo León': ['Monterrey'],
    },
  },
  Spain: {
    states: {
      Madrid: ['Madrid'],
      Catalonia: ['Barcelona'],
      Andalusia: ['Seville', 'Malaga'],
      Valencia: ['Valencia', 'Alicante'],
    },
  },
}

export const getMergedLocationData = (): Record<string, LocationData> => {
  try {
    const saved = localStorage.getItem('system_settings')
    if (saved) {
      const settings = JSON.parse(saved)
      if (settings.fullLocationData) {
        return settings.fullLocationData
      }

      const customLocations = settings.customLocations || {}
      const merged = JSON.parse(JSON.stringify(STATIC_LOCATION_DATA))

      const customRegions = settings.customRegions || []
      customRegions.forEach((r: string) => {
        if (!merged[r]) merged[r] = { states: {} }
      })

      for (const [country, data] of Object.entries(
        customLocations as Record<string, LocationData>,
      )) {
        if (!merged[country]) {
          merged[country] = { states: {} }
        }
        for (const [state, cities] of Object.entries(
          (data as any).states || {},
        )) {
          if (!merged[country].states[state]) {
            merged[country].states[state] = []
          }
          const allCities = [
            ...merged[country].states[state],
            ...(cities as string[]),
          ]
          merged[country].states[state] = Array.from(new Set(allCities)).sort()
        }
      }
      return merged
    }
  } catch (e) {
    console.error('Failed to merge location data', e)
  }
  return JSON.parse(JSON.stringify(STATIC_LOCATION_DATA))
}

export const LOCATION_DATA = getMergedLocationData()

export const COUNTRIES = Object.keys(LOCATION_DATA).sort()

export const REGIONS = Array.from(
  new Set(['Global', ...COUNTRIES, 'Europe', 'North America', 'South America']),
)
