import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption,
  Badge,
} from "vite_react_shadcn_ts";

export const ProductsTable = () => (
  <Table>
    <TableCaption>Catálogo de produtos — atualizado hoje</TableCaption>
    <TableHeader>
      <TableRow>
        <TableHead>Produto</TableHead>
        <TableHead>Preço</TableHead>
        <TableHead>Estoque</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">Fone Bluetooth Pro</TableCell>
        <TableCell>R$ 499,90</TableCell>
        <TableCell><Badge>32 un.</Badge></TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">Teclado Mecânico RGB</TableCell>
        <TableCell>R$ 329,00</TableCell>
        <TableCell><Badge variant="secondary">8 un.</Badge></TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">Webcam Full HD</TableCell>
        <TableCell>R$ 189,90</TableCell>
        <TableCell><Badge variant="destructive">Esgotado</Badge></TableCell>
      </TableRow>
    </TableBody>
  </Table>
);

export const OrdersTable = () => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Pedido</TableHead>
        <TableHead>Cliente</TableHead>
        <TableHead>Total</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell className="font-medium">#1042</TableCell>
        <TableCell>Mariana Souza</TableCell>
        <TableCell>R$ 829,90</TableCell>
      </TableRow>
      <TableRow>
        <TableCell className="font-medium">#1043</TableCell>
        <TableCell>Carlos Ribeiro</TableCell>
        <TableCell>R$ 189,90</TableCell>
      </TableRow>
    </TableBody>
  </Table>
);
