
-- Translate demo products to PT-BR. Match by current English name; safe re-run.
WITH t(en_name, pt_name, pt_desc, price, category) AS (VALUES
  -- TechCorp
  ('Quantum Laptop X1','Notebook Quantum X1','Ultraportátil de 14 polegadas com 32GB de RAM e 1TB de SSD.',9499::numeric,'notebooks'),
  ('Nebula Wireless Mouse','Mouse Sem Fio Nebula','Mouse Bluetooth ergonômico com clique silencioso.',249,'acessórios'),
  ('Aurora 4K Monitor','Monitor Aurora 4K','Tela IPS de 27 polegadas com dock USB-C.',2749,'monitores'),
  ('Pulse Mechanical Keyboard','Teclado Mecânico Pulse','Switches hot-swappable e iluminação RGB.',799,'acessórios'),
  ('Echo Noise-Cancelling Headphones','Fone com Cancelamento de Ruído Echo','Headphone over-ear, 40h de bateria, ANC.',1499,'áudio'),
  ('Vortex Webcam Pro','Webcam Vortex Pro','Webcam 4K com rastreamento por IA e microfones.',999,'acessórios'),
  ('Helios USB-C Hub','Hub USB-C Helios','8 em 1 com HDMI, Ethernet e leitor SD.',399,'acessórios'),
  ('Photon Smartphone 5G','Smartphone Photon 5G','Tela OLED de 6,7 polegadas e câmera de 200MP.',4999,'celulares'),
  ('Atlas Tablet 11','Tablet Atlas 11','Compatível com caneta, tela de 120Hz.',3249,'tablets'),
  ('Cosmo Smart Watch','Smartwatch Cosmo','Frequência cardíaca, GPS e bateria de 7 dias.',1249,'vestíveis'),
  -- FoodCorp
  ('Truffle Mac & Cheese','Macarrão à Trufa','Macarrão parafuso cremoso com lascas de trufa negra.',69,'pratos principais'),
  ('Wagyu Smash Burger','Smash Burger Wagyu','Hambúrguer duplo, cebola caramelizada e pão brioche.',89,'pratos principais'),
  ('Margherita Sourdough Pizza','Pizza Margherita de Fermentação Natural','Tomates San Marzano, fior di latte e manjericão.',79,'pizzas'),
  ('Korean Fried Chicken','Frango Frito Coreano','Duplamente frito, glaceado com gochujang e gergelim.',65,'pratos principais'),
  ('Avocado Citrus Salad','Salada de Abacate com Cítricos','Mix de folhas, laranja sanguínea e crocante de pistache.',55,'saladas'),
  ('Miso Glazed Salmon Bowl','Bowl de Salmão com Missô','Arroz japonês, edamame e gengibre em conserva.',85,'bowls'),
  ('Spicy Tonkotsu Ramen','Lámen Tonkotsu Apimentado','Caldo de porco de 12h, ovo mollet e nori.',75,'sopas'),
  ('Molten Chocolate Lava Cake','Petit Gâteau de Chocolate','Bolo quente com recheio de chocolate amargo e baunilha.',45,'sobremesas'),
  ('Matcha Tiramisu','Tiramisù de Matcha','Mascarpone, biscoito champanhe e matcha cerimonial.',49,'sobremesas'),
  ('Hibiscus Iced Tea','Chá Gelado de Hibisco','Preparado na casa com limão e hortelã.',25,'bebidas')
)
UPDATE public.products p
SET name = t.pt_name,
    description = t.pt_desc,
    price = t.price,
    category = t.category,
    updated_at = now()
FROM t
WHERE p.name = t.en_name;

-- Also translate the default category placeholder if any product still has it
UPDATE public.products SET category = 'geral' WHERE category = 'general';
