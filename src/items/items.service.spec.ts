import { Test } from '@nestjs/testing';
import { ItemsService } from './items.service';
import { ItemRepository } from './item.repository';

const mockItemRepository = () => ({
  find: jest.fn(),
});

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
});
