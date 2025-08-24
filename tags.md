---
layout: default
title: Tags
permalink: /tags/
---

<h1>Tags</h1>
{%- assign sorted = site.tags | sort -%}
{%- for tag in sorted -%}
  <h2 id="{{ tag[0] }}">{{ tag[0] }}</h2>
  <ul>
    {%- for post in tag[1] -%}
    <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a> <span class="muted">({{ post.date | date: "%-d %b %Y" }})</span></li>
    {%- endfor -%}
  </ul>
{%- endfor -%}
