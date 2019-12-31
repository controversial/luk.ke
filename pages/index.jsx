import React from 'react';
import Link from 'next/link';

import styles from './index.css';

const Index = () => (
  <div>
    <h1 className="heading-main">Luke Deen Taylor</h1>
    <Link href="/work/[project]" as="work/codus"><a>Codus</a></Link>

    <style jsx>{styles}</style>
  </div>
);

export default Index;
