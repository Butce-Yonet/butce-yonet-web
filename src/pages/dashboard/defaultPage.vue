<template>
  <div>
    <renderer :schema="schema" :renderers="resolvers" :gridResolver="gridResolver"></renderer>
  </div>
</template>

<script>
import RendererResolver from '@/data/rendererResolver';
import GridResolver from '@/data/gridResolver';
import Renderer from '@/dotboil-ui/renderers/renderer.vue';

import DotBoil from '@/dotboil-ui/dotboil';

import Page from '@/dotboil-ui/components/grid/page';
import Card from '@/dotboil-ui/components/basic/card';
import Row from '@/dotboil-ui/components/grid/row'
import Column from '@/dotboil-ui/components/grid/column';
import Table from '@/dotboil-ui/components/data/table';
import TableColumn from '@/dotboil-ui/components/data/tableColumn';
import FormattedTableColumn from '@/dotboil-ui/components/data/formattedTableColumn';
import Button from '@/dotboil-ui/components/basic/button';

export default {
  components: {
    'renderer': Renderer
  },
  data() {
    return {
      schema: new Page(),
      resolvers: {},
      gridResolver: GridResolver
    }
  },
  created() {
    this.resolvers = Object.assign({}, RendererResolver);
    this.schema.Size.Default = 12;

    this.schema.Name = "HomePage";
    var row = new Row();
    row.Name = "firstRow";

    var col1 = new Column();
    var col2 = new Column();
    var col3 = new Column();

    col1.Name = "Col1";
    col1.Size.Default = 6;
    col1.Size.Mt = 15;

    col2.Name = "Col2";
    col2.Size.Default = 6;
    col2.Size.Mt = 15;

    col3.Name = "Col3";
    col3.Size.Default = 6;
    col3.Size.Mt = 15;

    var card1 = new Card();
    card1.Title = "Son 20 İşlem";
    card1.SubTitle = "Bu ayın son 20 işlemi aşağıdaki gibidir";

    var last20Transactions = new Table();
    last20Transactions.Name = 'last20TransactionTable';
    card1.Content.push(last20Transactions);

    var card2 = new Card();
    card2.Title = "Ömer Faruk Şahin";
    card2.SubTitle = "Test"

    col1.Content.push(card1);
    col2.Content.push(card2);

    row.Content.push(col1);
    row.Content.push(col2);
    row.Content.push(col3);

    var nameColumn = new TableColumn();
    nameColumn.Name = "Ad";
    nameColumn.Field = "Name";

    var surnameColumn = new FormattedTableColumn();
    surnameColumn.Name = "Soyad";
    surnameColumn.Field = "Surname";

    surnameColumn.MapProperties.Text = 'Surname';

    var deleteButton = new Button();
    deleteButton.Name = 'TextButton';
    deleteButton.EmitEvents = {
      'click': 'deleteItem'
    };
    deleteButton.Variant = 'success';

    deleteButton.Size.M = 5;

    surnameColumn.Content.push(deleteButton);

    last20Transactions.Columns.push(nameColumn);
    last20Transactions.Columns.push(surnameColumn)

    this.schema.Content.push(row);

    DotBoil.on('last20TransactionTableOnLoad', () => {
      DotBoil.State['last20TransactionTable'].Items.push({
        Name: 'Ömer Faruk',
        Surname: 'Şahin'
      })
      DotBoil.State['last20TransactionTable'].Items.push({
        Name: 'Ömer Faruk 2',
        Surname: 'Şahin'
      })
      DotBoil.State['last20TransactionTable'].Items.push({
        Name: 'Ömer Faruk 3',
        Surname: 'Şahin'
      })
    })

    DotBoil.on('deleteItem', (eventItem) => {
      DotBoil.State['last20TransactionTable'].Loading = true;

      setTimeout(() => {
        DotBoil.State['last20TransactionTable'].Loading = false;
      }, 2500)
    });
  }
}

</script>