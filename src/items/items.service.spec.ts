import { Test } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemRepository } from './item.repository';
import { UserStatus } from '../auth/user-status.enum';
import { ItemStatus } from './item-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockItemRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  createItem: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockUser1 = {
  id: '1',
  name: 'test1',
  password: '1234',
  status: UserStatus.PREMIUM,
};
const mockUser2 = {
  id: '2',
  name: 'test2',
  password: '1234',
  status: UserStatus.FREE,
};

describe('ItemsServiceTest', () => {
  let itemsService;
  let itemRepository;

  beforeEach(async () => {
    // テスト用のモジュールを作成
    const module = await Test.createTestingModule({
      // providers配列内で、ItemsServiceとItemRepositoryの関係を定義しています。これは依存性注入の設定です。
      providers: [
        // テスト対象のサービスです。ItemsServiceのインスタンスがテスト中に使用されます。
        ItemsService,
        // ItemRepositoryの実際のインスタンスの代わりに、mockItemRepository関数によって生成されるモック（偽の実装）を使用するようにNestJSに指示しています。
        // provide: ItemRepositoryは、ItemRepositoryを依存関係として注入する場所を指定しています。
        // useFactory: mockItemRepositoryは、実際のItemRepositoryの代わりに使用するモックを生成するためのファクトリ関数を指定しています。
        { provide: ItemRepository, useFactory: mockItemRepository },
      ],
    }).compile(); // テストモジュールのインスタンスをコンパイルしてテスト実行の準備を整える

    //テストモジュールからItemsServiceとItemRepository（実際にはそのモック）を取得します。
    itemsService = module.get<ItemsService>(ItemsService);
    itemRepository = module.get<ItemRepository>(ItemRepository);
  });

  describe('findAll', () => {
    it('正常系', async () => {
      const expected = [];
      // itemRepository.find()が呼ばれたら、mockResolvedValueで指定した値を返すように設定しています。
      itemRepository.find.mockResolvedValue(expected);
      // itemsService.findAll()を実行して、itemRepository.find()が返す値が期待通りであることを確認します。
      const result = await itemsService.findAll();
      // 結果が空の配列と等しいことを確認
      expect(result).toEqual(expected);
    });
  });

  describe('findById', () => {
    it('正常系', async () => {
      const expected = {
        id: 'test-id',
        name: 'PC',
        price: 50000,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: '',
        updatedAt: '',
        userId: mockUser1.id,
        user: mockUser1,
      };

      itemRepository.findOne.mockResolvedValue(expected);
      const result = await itemsService.findById('test-id');
      expect(result).toEqual(expected);
    });

    it('異常系: 商品が存在しない', async () => {
      itemRepository.findOne.mockResolvedValue(null);
      await expect(itemsService.findById('test-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('正常系', async () => {
      const expected = {
        id: 'test-id',
        name: 'PC',
        price: 50000,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: '',
        updatedAt: '',
        userId: mockUser1.id,
        user: mockUser1,
      };

      itemRepository.createItem.mockResolvedValue(expected);
      const result = await itemsService.create(
        {
          name: 'PC',
          price: 50000,
          description: '',
        },
        mockUser1,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('updateStatus', () => {
    const mockItem = {
      id: 'test-id',
      name: 'PC',
      price: 50000,
      description: '',
      status: ItemStatus.SOLD_OUT,
      createdAt: '',
      updatedAt: '',
      userId: mockUser1.id,
      user: mockUser1,
    };
    it('正常系', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem);
      await itemsService.updateStatus('test-id', mockUser2);
      expect(itemRepository.save).toHaveBeenCalled();
    });

    it('異常系: 自身の商品を購入', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem);
      await expect(
        itemsService.updateStatus('test-id', mockUser1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('create', () => {
    it('正常系', async () => {
      const expected = {
        id: 'test-id',
        name: 'PC',
        price: 50000,
        description: '',
        status: ItemStatus.ON_SALE,
        createdAt: '',
        updatedAt: '',
        userId: mockUser1.id,
        user: mockUser1,
      };

      itemRepository.createItem.mockResolvedValue(expected);
      const result = await itemsService.create(
        {
          name: 'PC',
          price: 50000,
          description: '',
        },
        mockUser1,
      );
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    const mockItem = {
      id: 'test-id',
      name: 'PC',
      price: 50000,
      description: '',
      status: ItemStatus.SOLD_OUT,
      createdAt: '',
      updatedAt: '',
      userId: mockUser1.id,
      user: mockUser1,
    };
    it('正常系', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem);
      await itemsService.delete('test-id', mockUser1);
      expect(itemRepository.delete).toHaveBeenCalled();
    });

    it('異常系: 他人の商品を削除', async () => {
      itemRepository.findOne.mockResolvedValue(mockItem);
      await expect(itemsService.delete('test-id', mockUser2)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
