// Mock data for Portuguese car dealership

export const mockCars = [
  {
    id: 1,
    brand: "BMW",
    year: 2020,
    model: "320i",
    mileage: 45000,
    price: 28500,
    images: [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500&h=300&fit=crop"
    ],
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Preto",
    description: "BMW 320i em excelente estado, com todos os extras de série.",
    featured: true
  },
  {
    id: 2,
    brand: "Mercedes-Benz",
    year: 2019,
    model: "C200",
    mileage: 52000,
    price: 32000,
    images: [
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500&h=300&fit=crop"
    ],
    fuel: "Gasolina",
    transmission: "Automática",
    color: "Prata",
    description: "Mercedes-Benz C200 com interior em pele e navegação GPS.",
    featured: true
  },
  {
    id: 3,
    brand: "Audi",
    year: 2021,
    model: "A4",
    mileage: 25000,
    price: 35000,
    images: [
      "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=500&h=300&fit=crop",
      "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&h=300&fit=crop"
    ],
    fuel: "Diesel",
    transmission: "Automática",
    color: "Branco",
    description: "Audi A4 quase novo com garantia de fábrica ainda válida.",
    featured: true
  },
  {
    id: 4,
    brand: "Volkswagen",
    year: 2018,
    model: "Golf",
    mileage: 65000,
    price: 18500,
    images: [
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500&h=300&fit=crop"
    ],
    fuel: "Gasolina",
    transmission: "Manual",
    color: "Azul",
    description: "Volkswagen Golf 1.4 TSI em bom estado geral.",
    featured: false
  },
  {
    id: 5,
    brand: "Peugeot",
    year: 2020,
    model: "308",
    mileage: 38000,
    price: 22000,
    images: [
      "https://images.unsplash.com/photo-1563720223185-11003d516935?w=500&h=300&fit=crop"
    ],
    fuel: "Diesel",
    transmission: "Automática",
    color: "Cinzento",
    description: "Peugeot 308 com excelente consumo de combustível.",
    featured: true
  },
  {
    id: 6,
    brand: "Renault",
    year: 2019,
    model: "Clio",
    mileage: 48000,
    price: 15500,
    images: [
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=500&h=300&fit=crop"
    ],
    fuel: "Gasolina",
    transmission: "Manual",
    color: "Vermelho",
    description: "Renault Clio ideal para cidade, económico e confiável.",
    featured: false
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "João Silva",
    rating: 5,
    text: "Excelente atendimento! Comprei o meu BMW aqui e foi uma experiência fantástica. Recomendo a todos!"
  },
  {
    id: 2,
    name: "Maria Santos",
    rating: 4.8,
    text: "Profissionais muito competentes. O processo de financiamento foi muito claro e transparente."
  },
  {
    id: 3,
    name: "Carlos Oliveira",
    rating: 4.9,
    text: "Grande variedade de carros e preços justos. O meu Audi estava em perfeito estado."
  }
];

// Portuguese financing rates based on provided data
export const financingRates = {
  new: {
    tan: 7.25, // Average TAN for new cars
    taeg: 9.1, // Average TAEG for new cars
    minMonths: 24,
    maxMonths: 120
  },
  used: {
    tan: 8.5, // Average TAN for used cars
    taeg: 10.2, // Average TAEG for used cars
    minMonths: 24,
    maxMonths: 96
  }
};

export const mockBrands = [
  "BMW", "Mercedes-Benz", "Audi", "Volkswagen", "Peugeot", "Renault", 
  "Citroën", "Fiat", "Ford", "Opel", "Nissan", "Toyota", "Honda", "Hyundai"
];

export const mockYears = [];
for (let year = 2024; year >= 2010; year--) {
  mockYears.push(year);
}