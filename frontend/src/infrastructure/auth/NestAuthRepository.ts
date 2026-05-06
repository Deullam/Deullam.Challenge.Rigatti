/**
 * @author Deullam Justi
 * @copyright Copyright (c) 2026 Deullam Justi - Todos os direitos reservados.
 * @description Repositório de autenticação que se comunica com o backend NestJS.
 * Implementa as chamadas HTTP para Login e Criação de Empresa (Workspace).
 */

import { IAuthRepository, ILoginCredentials, IRegisterCredentials, IAuthUser } from '../../domain/auth/IAuthRepository';
import { api } from '../../lib/api';

export class NestAuthRepository implements IAuthRepository {

  /**
 * @description Implementação do repositório para NestJS.
 * Garante que os nomes das chaves no LocalStorage sejam compatíveis com o AuthContext.
 */
  async login(credentials: ILoginCredentials): Promise<{ user: IAuthUser; access_token: string }> {
    let response;
    try {
      // 1. Chamada direta à tua API NestJS
      response = await api.post('/auth/login', credentials);
    } catch (error: any) {
      if (error.response?.data?.message === 'Invalid credentials.') {
        throw new Error('Credenciais inválidas. Verifique seu e-mail e senha.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao conectar com o servidor.');
    }

    const { access_token, user } = response.data;

    // 2. Documentação: Forçamos o salvamento com os nomes que o nosso Contexto espera
    // Eliminamos aqui qualquer interferência de nomes automáticos do Supabase
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('auth_user', JSON.stringify(user));

    return {
      user,
      access_token
    };
  }

  /**
   * @description Processa o cadastro de um novo Administrador e cria uma nova Empresa.
   */
  async register(credentials: IRegisterCredentials): Promise<{ user: IAuthUser; access_token: string; companyName: string }> {
    // Documentação: O Repositório envia os dados (incluindo o companyName) para o backend.
    // O backend NestJS é quem cria a empresa no banco e devolve o usuário recém-criado.
    let response;
    try {
      response = await api.post('/auth/register', credentials);
    } catch (error: any) {
      if (error.response?.data?.message === 'Email already in use.') {
        throw new Error('Este e-mail já está em uso por outra conta.');
      }
      throw new Error(error.response?.data?.message || 'Erro ao conectar com o servidor durante o cadastro.');
    }

    const { access_token, user, companyName } = response.data;

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      access_token,
      // Documentação: Retornamos o nome da empresa para respeitar a interface
      companyName: companyName || credentials.companyName
    };
  }

  /**
   * @description Recupera o usuário logado diretamente da memória do navegador (Cache).
   */
  async getCurrentUser(): Promise<IAuthUser | null> {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * @description Realiza o logoff local, limpando todas as chaves de segurança.
   */
  async logout(): Promise<void> {
    // Garantimos que a chave 'access_token' exata seja removida.
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
  }
}