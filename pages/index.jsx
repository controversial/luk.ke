import React from 'react';
import Link from 'next/link';

const Index = () => (
  <div>
    <h1>Luke Deen Taylor</h1>
    <Link href="/work/[project]" as="work/codus"><a>Codus</a></Link>
  </div>
);

export default Index;
