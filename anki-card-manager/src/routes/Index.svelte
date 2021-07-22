<script lang='ts'>
  import 'smelte/src/tailwind.css'

  import { Router, Route } from 'svelte-routing'

  import Chinese from '../components/Chinese.svelte'
  import Home from '../components/Home.svelte'

  export let url = ''
</script>

<Router {url}>
  <div>
    <Route path='/' component={Home} />
    <Route path='chinese' component={Chinese} />
  </div>
</Router>

<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  aside {
    margin-top: 0
  }
</style>
