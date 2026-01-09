import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import WeatherWidget from '@/components/widgets/WeatherWidget';
import NewsWidget from '@/components/widgets/NewsWidget';
import RedditWidget from '@/components/widgets/RedditWidget';
import HackerNewsWidget from '@/components/widgets/HackerNewsWidget';
import TrendingWidget from '@/components/widgets/TrendingWidget';
import QuoteWidget from '@/components/widgets/QuoteWidget';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Header />
      
      <main className={styles.main}>
        <QuoteWidget />
        
        <div className={styles.grid}>
          <div className={styles.column}>
            <WeatherWidget defaultLocation="New York" />
            <TrendingWidget />
          </div>
          
          <div className={styles.column}>
            <HackerNewsWidget />
            <NewsWidget />
          </div>
          
          <div className={styles.columnFull}>
            <RedditWidget />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
