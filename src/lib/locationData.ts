interface LocationData {
  states: Record<string, string[]>
}

const STATIC_LOCATION_DATA: Record<string, LocationData> = {
  Brasil: {
    states: {
      Acre: ['Rio Branco'],
      Alagoas: ['Maceió'],
      Amapá: ['Macapá'],
      Amazonas: ['Manaus'],
      Bahia: ['Salvador'],
      Ceará: ['Fortaleza'],
      'Distrito Federal': ['Brasília'],
      'Espírito Santo': ['Vitória'],
      Goiás: ['Goiânia'],
      Maranhão: ['São Luís'],
      'Mato Grosso': ['Cuiabá'],
      'Mato Grosso do Sul': ['Campo Grande'],
      'Minas Gerais': ['Belo Horizonte'],
      Pará: ['Belém'],
      Paraíba: ['João Pessoa'],
      Paraná: ['Curitiba'],
      Pernambuco: ['Recife'],
      Piauí: ['Teresina'],
      'Rio de Janeiro': ['Rio de Janeiro'],
      'Rio Grande do Norte': ['Natal'],
      'Rio Grande do Sul': ['Porto Alegre'],
      Rondônia: ['Porto Velho'],
      Roraima: ['Boa Vista'],
      'Santa Catarina': ['Florianópolis'],
      'São Paulo': ['São Paulo'],
      Sergipe: ['Aracaju'],
      Tocantins: ['Palmas'],
    },
  },
  USA: {
    states: {
      Alabama: ['Montgomery'],
      Alaska: ['Juneau'],
      Arizona: ['Phoenix'],
      Arkansas: ['Little Rock'],
      California: ['Sacramento', 'Los Angeles', 'San Francisco'],
      Colorado: ['Denver'],
      Connecticut: ['Hartford'],
      Delaware: ['Dover'],
      Florida: ['Tallahassee', 'Miami', 'Orlando'],
      Georgia: ['Atlanta'],
      Hawaii: ['Honolulu'],
      Idaho: ['Boise'],
      Illinois: ['Springfield', 'Chicago'],
      Indiana: ['Indianapolis'],
      Iowa: ['Des Moines'],
      Kansas: ['Topeka'],
      Kentucky: ['Frankfort'],
      Louisiana: ['Baton Rouge'],
      Maine: ['Augusta'],
      Maryland: ['Annapolis'],
      Massachusetts: ['Boston'],
      Michigan: ['Lansing'],
      Minnesota: ['St. Paul'],
      Mississippi: ['Jackson'],
      Missouri: ['Jefferson City'],
      Montana: ['Helena'],
      Nebraska: ['Lincoln'],
      Nevada: ['Carson City', 'Las Vegas'],
      'New Hampshire': ['Concord'],
      'New Jersey': ['Trenton'],
      'New Mexico': ['Santa Fe'],
      'New York': ['Albany', 'New York City'],
      'North Carolina': ['Raleigh'],
      'North Dakota': ['Bismarck'],
      Ohio: ['Columbus'],
      Oklahoma: ['Oklahoma City'],
      Oregon: ['Salem'],
      Pennsylvania: ['Harrisburg'],
      'Rhode Island': ['Providence'],
      'South Carolina': ['Columbia'],
      'South Dakota': ['Pierre'],
      Tennessee: ['Nashville'],
      Texas: ['Austin', 'Dallas', 'Houston'],
      Utah: ['Salt Lake City'],
      Vermont: ['Montpelier'],
      Virginia: ['Richmond'],
      Washington: ['Olympia', 'Seattle'],
      'West Virginia': ['Charleston'],
      Wisconsin: ['Madison'],
      Wyoming: ['Cheyenne'],
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
