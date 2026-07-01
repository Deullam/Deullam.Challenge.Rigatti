import {
  Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext,
  Card, CardContent,
} from "vite_react_shadcn_ts";

const slides = [
  { nome: "Fone Bluetooth Pro", preco: "R$ 499,90" },
  { nome: "Teclado Mecânico RGB", preco: "R$ 349,90" },
  { nome: "Monitor 27\" 144Hz", preco: "R$ 1.799,90" },
];

export const ProductCarousel = () => (
  <Carousel className="w-full max-w-xs">
    <CarouselContent>
      {slides.map((s) => (
        <CarouselItem key={s.nome}>
          <Card>
            <CardContent className="flex aspect-square flex-col items-center justify-center gap-2 p-6">
              <span className="text-base font-semibold">{s.nome}</span>
              <span className="text-2xl font-bold text-primary">{s.preco}</span>
              <span className="text-sm text-muted-foreground">Frete grátis</span>
            </CardContent>
          </Card>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);
