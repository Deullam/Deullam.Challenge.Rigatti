import { AspectRatio } from "vite_react_shadcn_ts";

export const Widescreen = () => (
  <div className="w-[320px]">
    <AspectRatio ratio={16 / 9}>
      <img
        src="https://picsum.photos/400/300"
        alt="Foto do produto"
        className="object-cover w-full h-full rounded-md"
      />
    </AspectRatio>
  </div>
);

export const ProductThumb = () => (
  <div className="w-[320px] space-y-2">
    <AspectRatio ratio={16 / 9}>
      <img
        src="https://picsum.photos/400/300?random=2"
        alt="Fone Bluetooth Pro"
        className="object-cover w-full h-full rounded-md"
      />
    </AspectRatio>
    <p className="text-sm font-medium">Fone Bluetooth Pro — R$ 499,90</p>
  </div>
);
