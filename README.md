# setTemplate
setTemplate function allow you to set your html from another html file.

All script tags inside your template are evaluated as function so every script is scoped. That allows you to use ```const```, ```let``` or ```function``` inside script tag which does not affect another file template.

Its lightweight library (1.6kb) that can be used with any other library such as React.js, jQuery and so on...

## How to use?

### index.html
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Template system test</title>
    <script src="setTemplate/setTemplate.min.js"></script>
</head>
<body>

    <header>
        <script>
            const headerTemplate = new Template("header.html");
            //template from file will be auto inserted ti the element where was called
        </script>
    </header>

    <main>
        <script>
            new Template("main.html");
        </script>
    </main>

    <footer>
        <script>
            new Template("footer.html", {
                items: [
                    "a", "b", "c", "d", "e"
                ],
                headerTemplate
            });
        </script>
    </footer>

</body>
</html>
```

### header.html
```
<!-- scoped script, can be only one local like this and one global -->
<script>
    console.log(this); //special local component context

    const { id } = this;

    function toggle() {
        id.ul.classList.toggle("hidden");
    }

    return {
        toggle
    };
</script>

<script global>
    console.log(this); //window
</script>

<ul class="hidden" id="ul">
    <li>1</li>
    <li>2</li>
    <li>3</li>
    <li>4</li>
</ul>
<!-- scoped style for this component only -->
<style>
    ul {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        align-items: center;
        list-style-type: none;
    }

    ul.hidden {
        display: none;
    }

    li {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
```

### main.html
```
<script>
    const { history } = this;
    history.push = true; //push this page to history for routing
</script>

<section>
    <p>hello world!</p>
</section>
```

### footer.html
```
<script>
    const { props, id, style } = this;

    style(id.list, {
        "--count": props.items.length
    });

    props.items.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;

        id.list.appendChild(li);
    });

    //access the header template that return something from script element
    props.headerTemplate.then(params => {
        id.list.onclick = () => params.toggle(); //calling the toggle function from header component
    });
</script>

<ul id="list">
    
</ul>

<style>
    ul {
        display: grid;
        grid-template-columns: repeat(var(--count), 1fr);
        align-items: center;
        list-style-type: none;
    }

    li {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
```

