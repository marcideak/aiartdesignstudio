import React , {useState} from 'react';
import PropTypes from 'prop-types';
import './styles.scss'
import Button from '../../components/button';
import AboutItem from './about-item';

About.propTypes = {
    data : PropTypes.array,
};

function About(props) {

    const {data} = props;

    const [dataBlock] = useState(
        {
            subtitle : 'Rólunk',
            title: 'Kik vagyunk?',
            desc : 'Szolgáltatásaink közé tartozik a logó- és arculattervezés, a digitális illusztráció, a webdesign, az animáció és a videószerkesztés. Minden projektet személyre szabunk az ügyfelek igényei és elvárásai szerint, és együtt dolgozunk velük azért, hogy a legjobb végeredményt érjük el.'
        }
    )

    return (
        <section className="tf-section tf-about">
            <div className="container">
                <div className="row">
                    <div className="col-xl-5 col-md-12">
                        <div className="content-about mobie-40" data-aos="fade-up" data-aos-duration="800">
                            <div className="tf-title st2">
                                <p className="h8 sub-title">{dataBlock.subtitle}</p>
                                <h4 className="title">{dataBlock.title}</h4>
                            </div>
                            <p>{dataBlock.desc}</p>
                                <Button title="Üzenet" path='/contact' />
                        </div>
                    </div>
                    <div className="col-xl-7 col-md-12">
                        <div className="wrap-about" data-aos="fade-up" data-aos-duration="800">
                            {
                                data.map(item => (
                                    <AboutItem key={item.id} item={item} />
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default About;