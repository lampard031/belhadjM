# FTC Automóveis - Contratos de API

## 1. API Contracts

### Cars API
```
GET /api/cars - Obter todos os carros
GET /api/cars/:id - Obter carro por ID
POST /api/cars - Criar novo carro (Admin)
PUT /api/cars/:id - Atualizar carro (Admin)
DELETE /api/cars/:id - Remover carro (Admin)
GET /api/cars/featured - Obter carros em destaque
POST /api/cars/search - Pesquisar carros com filtros
```

### Jet-Skis API
```
GET /api/jetskis - Obter todos os jet-skis
GET /api/jetskis/:id - Obter jet-ski por ID
POST /api/jetskis - Criar novo jet-ski (Admin)
PUT /api/jetskis/:id - Atualizar jet-ski (Admin)
DELETE /api/jetskis/:id - Remover jet-ski (Admin)
GET /api/jetskis/featured - Obter jet-skis em destaque
POST /api/jetskis/search - Pesquisar jet-skis com filtros
```

### Reservations API
```
POST /api/reservations - Criar reserva (1000€ via Stripe)
GET /api/reservations - Listar reservas (Admin)
GET /api/reservations/:id - Obter reserva por ID
PUT /api/reservations/:id/status - Atualizar status da reserva
```

### Financing API
```
POST /api/financing/calculate - Calcular simulação de financiamento
POST /api/financing/request - Solicitar pré-aprovação
```

### Admin API
```
POST /api/admin/login - Login de administrador
GET /api/admin/stats - Estatísticas do dashboard
```

## 2. Dados Mockados (mockData.js)

### Carros (mockCars)
- 6 carros portugueses com marcas como BMW, Mercedes, Audi, VW, Peugeot, Renault
- Cada carro tem: id, brand, year, model, mileage, price, images, fuel, transmission, color, description, featured
- Preços em EUR, quilometragem, especificações portuguesas
- Dados realistas para FTC Automóveis em Arcozelo

### Jet-Skis (mockJetSkis)
- 4 jet-skis com marcas como Yamaha, Sea-Doo, Kawasaki
- Cada jet-ski tem: id, brand, year, model, hours, price, images, engine, passengers, fuel, color, description, featured, type
- Especificações aquáticas: horas de uso, motor, capacidade de passageiros
- Preços competitivos no mercado português de jet-skis

### Taxas de Financiamento (financingRates)
- **Carros Novos**: TAN 7.25%, TAEG 9.1%, prazo 24-120 meses
- **Carros Usados**: TAN 8.5%, TAEG 10.2%, prazo 24-96 meses
- Baseado nas taxas reais praticadas em Portugal

### Marcas e Anos
- 14 marcas principais no mercado português
- Anos de 2010 a 2024

## 3. Backend a Implementar

### Modelos MongoDB
```python
# Car Model
{
    "_id": ObjectId,
    "brand": str,
    "year": int,
    "model": str,
    "mileage": int,
    "price": float,
    "images": [str],  # URLs das imagens
    "fuel": str,  # Gasolina, Diesel, Híbrido, Elétrico
    "transmission": str,  # Manual, Automática
    "color": str,
    "description": str,
    "featured": bool,
    "type": str,  # "car"
    "created_at": datetime,
    "updated_at": datetime
}

# JetSki Model
{
    "_id": ObjectId,
    "brand": str,
    "year": int,
    "model": str,
    "hours": int,  # Horas de uso
    "price": float,
    "images": [str],  # URLs das imagens
    "engine": str,  # Motor (ex: 1812cc)
    "passengers": int,  # Número de passageiros
    "fuel": str,  # Gasolina (padrão para jet-skis)
    "color": str,
    "description": str,
    "featured": bool,
    "type": str,  # "jetski"
    "created_at": datetime,
    "updated_at": datetime
}

# Reservation Model
{
    "_id": ObjectId,
    "car_id": ObjectId,
    "customer_name": str,
    "customer_email": str,
    "customer_phone": str,
    "stripe_payment_id": str,
    "amount": float,  # 1000.00 EUR
    "status": str,  # pending, paid, confirmed, cancelled
    "created_at": datetime
}

# Financing Request Model
{
    "_id": ObjectId,
    "customer_name": str,
    "customer_email": str,
    "customer_phone": str,
    "car_id": ObjectId,
    "vehicle_price": float,
    "down_payment": float,
    "loan_term": int,
    "vehicle_type": str,  # new, used
    "monthly_payment": float,
    "total_payment": float,
    "tan": float,
    "taeg": float,
    "status": str,  # pending, approved, rejected
    "created_at": datetime
}

# Admin Model
{
    "_id": ObjectId,
    "username": str,
    "password_hash": str,
    "email": str,
    "created_at": datetime
}
```

### Integração Stripe
- Configurar webhook para pagamentos de reserva
- Processar pagamentos de 1000€
- Atualizar status da reserva após pagamento confirmado
- Guardar Stripe payment ID para referência

### Cálculos de Financiamento
- Implementar fórmulas de TAN e TAEG portuguesas
- Validar prazos mínimos e máximos por tipo de veículo
- Calcular prestação mensal, montante total e juros
- Aplicar comissões e taxas adicionais conforme TAEG

## 4. Integração Frontend & Backend

### Substituições Necessárias
1. **mockCars** → GET /api/cars
2. **Formulário de Reserva** → POST /api/reservations + Stripe
3. **Calculadora de Financiamento** → POST /api/financing/calculate
4. **Admin Dashboard** → GET /api/admin/stats
5. **Gestão de Carros** → CRUD /api/cars

### Estados e Context
- Implementar CarContext para gestão do estado dos carros
- AdminContext para autenticação de administrador
- Toast notifications para feedback de ações

### Validações
- Formulários com validação de dados portugueses (NIF, telefone)
- Upload de imagens para carros (Admin)
- Validação de preços e especificações

## 5. Funcionalidades Implementadas

### ✅ Frontend Completo
- Homepage com design pixel-perfect do AutosDeal adaptado para FTC Automóveis
- Catálogo de carros com filtros avançados
- **Nova seção de jet-skis** com página dedicada e filtros específicos
- Páginas de detalhes de carro/jet-ski com reserva de 1.000€
- Calculadora de financiamento com taxas portuguesas (TAN/TAEG)
- Painel de administração para gestão de carros E jet-skis
- Sistema de autenticação admin (mock)
- Design responsivo e animações
- Branding completo da FTC Automóveis com dados reais
- Menu atualizado: Início | Carros | **Jet-Skis** | Novidades | Financiamento | Contactar

### ✅ Integrações Previstas
- Stripe para pagamentos de reserva (1000€)
- Sistema de financiamento com taxas portuguesas
- Upload de imagens para carros
- Sistema de notificações por email
- Dashboard com estatísticas e métricas

### 🔄 Próximos Passos
1. Implementar backend com MongoDB
2. Integrar Stripe para reservas
3. Conectar frontend com API real
4. Testes e validação
5. Deploy e configuração de produção

## 6. Informações da Empresa

### FTC Automóveis
- **Nome**: FTC Automóveis
- **Proprietário**: Fábio Costa
- **Telefone**: +351 923 575 015 / +351 223 176 692
- **Email**: ftcautomoveis@gmail.com
- **Website**: www.ftcautomoveis.com
- **Morada**: Rua das Pedrinhas Brancas, 682, 4410-365 Arcozelo VNG, Portugal
- **Redes Sociais**: Facebook, Instagram, WhatsApp

### Credenciais Demo
- **Admin Login**: admin / admin123
- **Teste de Financiamento**: Preço 30.000€, Entrada 5.000€, Prazo 60 meses = ~534€/mês