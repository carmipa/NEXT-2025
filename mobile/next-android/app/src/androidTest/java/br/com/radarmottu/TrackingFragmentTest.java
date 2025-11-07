package br.com.radarmottu;

import android.os.Bundle;
import androidx.fragment.app.FragmentFactory;
import androidx.fragment.app.testing.FragmentScenario;
import androidx.test.espresso.Espresso;
import androidx.test.espresso.assertion.ViewAssertions;
import androidx.test.espresso.matcher.ViewMatchers;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import br.com.radarmottu.R;
import br.com.radarmottu.ui.tracking.TrackingFragment;

@RunWith(AndroidJUnit4.class)
public class TrackingFragmentTest {

    @Before
    public void setUp() {
        // Inicia o TrackingFragment isoladamente com o tema da aplicação
        // O quarto parâmetro nulo é explicitamente convertido para FragmentFactory para resolver a ambiguidade do método.
        FragmentScenario.launchInContainer(TrackingFragment.class, (Bundle) null, R.style.Theme_Radarmottu, (FragmentFactory) null);
    }

    @Test
    public void testTrackingScreenViewsAreDisplayed() {
        // Verifica se as views principais estão visíveis
        Espresso.onView(ViewMatchers.withId(R.id.sonar_view)).check(ViewAssertions.matches(ViewMatchers.isDisplayed()));
        Espresso.onView(ViewMatchers.withId(R.id.plate_input_layout)).check(ViewAssertions.matches(ViewMatchers.isDisplayed()));
        Espresso.onView(ViewMatchers.withId(R.id.text_websocket_status)).check(ViewAssertions.matches(ViewMatchers.isDisplayed()));
        Espresso.onView(ViewMatchers.withId(R.id.image_view_sound)).check(ViewAssertions.matches(ViewMatchers.isDisplayed()));
    }
}
