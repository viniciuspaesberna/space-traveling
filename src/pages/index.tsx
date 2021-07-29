import { FiCalendar, FiUser } from 'react-icons/fi'
import { GetStaticProps } from 'next';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { getPrismicClient } from '../services/prismic';
import { useEffect, useState } from 'react';


import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header'

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {

  const [nextPage, setNextPage] = useState(postsPagination.next_page)
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  async function handleNextPage(){
    console.log(postsPagination.next_page)
    fetch(nextPage)
      .then(res => res.json())
      .then(data => {
        const newPosts: Post[] = data.results.map(post => {
          
          return {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        })
        
        setNextPage(data.next_page)
        setPosts([...posts, ...newPosts])
      })

  }

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header />

      <main className={commonStyles.container}>
        <div className={styles.postList}>
          <ul>
            {posts.map( post => (
              <article key={post.uid}>
                <Link href={`/post/${post.uid}`}>
                  <a>
                    <strong>{post.data.title}</strong>
                    <p>{post.data.subtitle}</p>
                  </a>
                </Link>
                <div>
                  <time>
                    <FiCalendar />
                    {format(new Date(post.first_publication_date), 'dd LLL y', { locale: ptBR})}
                  </time>
                  <span>
                    <FiUser />
                    {post.data.author}
                  </span>
                </div>
              </article>
            ))}
          </ul>
        </div>
        { nextPage && <a onClick={handleNextPage} className={styles.loadMore}>Carregar mais posts</a> }
      </main>
    </>
  )
}
 
export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query('', {pageSize: 2});

  const posts = postsResponse.results.map(post => {
    return {
      uid: String(post.uid),
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: posts
      }
    },
    revalidate: 60 * 60 * 24 //24hours
  }
};
