import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { CredentialsDto } from './dto/credentials.dto';
@Injectable()
export class AuthService {
  // UserRepositoryクラスのインスタンスをこのクラスのプライベートプロパティとして注入し、そのインスタンスを通じてユーザーデータに関する操作を行うために使用されることを意味します。NestJSでは、これを利用して様々な依存関係をクラスに注入し、モジュール性とテストの容易さを向上させています。
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<User> {
    return await this.userRepository.createUser(createUserDto);
  }

  async signIn(
    credentialsDto: CredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = credentialsDto;
    const user = await this.userRepository.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // ユーザーが存在し、かつパスワードが一致する場合、JWTを生成して返します。
      const payload = { id: user.id, username: user.username };
      const accessToken = await this.jwtService.sign(payload);
      return { accessToken };
    }
    throw new UnauthorizedException(
      'ユーザー名またはパスワードを確認してください',
    );
  }
}
